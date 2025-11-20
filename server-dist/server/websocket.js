"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = require("http");
const tarotEngine_1 = require("../lib/tarotEngine");
const botPlayer_1 = require("../lib/botPlayer");
const distributionSeeder_1 = require("../lib/distributionSeeder");
const supabase_1 = require("../lib/supabase");
const clients = new Map();
const tableGames = new Map();
const tablePlayers = new Map();
const httpServer = (0, http_1.createServer)();
const wss = new ws_1.WebSocketServer({ server: httpServer });
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            await handleClientMessage(ws, message);
        }
        catch (error) {
            console.error('Error parsing message:', error);
            sendError(ws, 'Invalid message format');
        }
    });
    ws.on('close', () => {
        handleDisconnect(ws);
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
async function handleClientMessage(ws, message) {
    switch (message.type) {
        case 'JOIN_TABLE':
            await handleJoinTable(ws, message.payload);
            break;
        case 'LEAVE_TABLE':
            handleLeaveTable(ws);
            break;
        case 'READY':
            await handleReady(ws);
            break;
        case 'BID':
            handleBid(ws, message.payload);
            break;
        case 'PLAY_CARD':
            handlePlayCard(ws, message.payload);
            break;
        case 'ADD_BOT':
            await handleAddBot(ws, message.payload);
            break;
        case 'REMOVE_BOT':
            await handleRemoveBot(ws, message.payload);
            break;
        case 'PING':
            sendMessage(ws, { type: 'PONG' });
            break;
        default:
            sendError(ws, 'Unknown message type');
    }
}
async function handleJoinTable(ws, payload) {
    const { tableId, userId, displayName } = payload;
    if (!tableId || !userId || !displayName) {
        sendError(ws, 'Missing required fields');
        return;
    }
    const client = {
        ws,
        userId,
        tableId,
        displayName,
    };
    clients.set(ws, client);
    try {
        await supabase_1.supabase
            .from('table_players')
            .update({ is_ready: true })
            .eq('table_id', tableId)
            .eq('user_id', userId);
        const { data: dbPlayers, error } = await supabase_1.supabase
            .from('table_players')
            .select('*, users!inner(id, display_name)')
            .eq('table_id', tableId)
            .order('seat_index', { ascending: true });
        if (error) {
            console.error('Error fetching players from DB:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            sendError(ws, 'Failed to load table players');
            return;
        }
        const players = (dbPlayers || []).map((dbPlayer) => ({
            id: dbPlayer.user_id,
            userId: dbPlayer.user_id,
            displayName: dbPlayer.users.display_name,
            seatIndex: dbPlayer.seat_index,
            isReady: true,
        }));
        tablePlayers.set(tableId, players);
        sendMessage(ws, {
            type: 'TABLE_STATE',
            payload: {
                tableId,
                players,
            },
        });
        broadcastToTable(tableId, {
            type: 'PLAYER_JOINED',
            payload: { player: players.find(p => p.userId === userId) },
        });
        const gameState = tableGames.get(tableId);
        if (gameState) {
            console.log('[JOIN] Game already started, sending game state to new player');
            sendGameState(ws, gameState);
        }
        else if (players.length === 4) {
            console.log('[JOIN] 4 players present, scheduling auto-start in 2 seconds');
            setTimeout(() => {
                const currentPlayers = tablePlayers.get(tableId) || [];
                console.log('[AUTO-START] Checking conditions:', {
                    playerCount: currentPlayers.length,
                    hasGame: !!tableGames.get(tableId)
                });
                if (currentPlayers.length === 4 && !tableGames.get(tableId)) {
                    console.log('[AUTO-START] Starting game automatically');
                    startGame(tableId, currentPlayers);
                }
                else {
                    console.log('[AUTO-START] Conditions not met, aborting');
                }
            }, 2000);
        }
        else {
            console.log(`[JOIN] Waiting for more players (${players.length}/4)`);
        }
    }
    catch (error) {
        console.error('Error in handleJoinTable:', error);
        sendError(ws, 'Failed to join table');
    }
}
function handleLeaveTable(ws) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    const players = tablePlayers.get(client.tableId) || [];
    const filteredPlayers = players.filter(p => p.userId !== client.userId);
    tablePlayers.set(client.tableId, filteredPlayers);
    broadcastToTable(client.tableId, {
        type: 'PLAYER_LEFT',
        payload: { userId: client.userId },
    });
    if (filteredPlayers.length === 0) {
        tableGames.delete(client.tableId);
        tablePlayers.delete(client.tableId);
    }
    client.tableId = null;
}
async function handleReady(ws) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    try {
        const { error } = await supabase_1.supabase
            .from('table_players')
            .update({ is_ready: true })
            .eq('table_id', client.tableId)
            .eq('user_id', client.userId);
        if (error) {
            console.error('Error updating ready status:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            sendError(ws, 'Failed to update ready status');
            return;
        }
        const players = tablePlayers.get(client.tableId) || [];
        const player = players.find(p => p.userId === client.userId);
        if (!player)
            return;
        player.isReady = true;
        tablePlayers.set(client.tableId, players);
        broadcastToTable(client.tableId, {
            type: 'PLAYER_READY',
            payload: { userId: client.userId },
        });
        if (players.length === 4 && players.every(p => p.isReady)) {
            await startGame(client.tableId, players);
        }
    }
    catch (error) {
        console.error('Error in handleReady:', error);
        sendError(ws, 'Failed to set ready status');
    }
}
function handleBid(ws, payload) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    const { bidType } = payload;
    if (!bidType) {
        sendError(ws, 'Missing bid type');
        return;
    }
    const gameState = tableGames.get(client.tableId);
    if (!gameState)
        return;
    const player = gameState.players.find(p => p.userId === client.userId);
    if (!player)
        return;
    if (gameState.phase !== 'BIDDING') {
        sendError(ws, 'Not in bidding phase');
        return;
    }
    if (gameState.currentPlayerSeat !== player.seatIndex) {
        sendError(ws, 'Not your turn');
        return;
    }
    try {
        const newState = (0, tarotEngine_1.applyBid)(gameState, player.seatIndex, bidType);
        tableGames.set(client.tableId, newState);
        broadcastToTable(client.tableId, {
            type: 'BID_PLACED',
            payload: { playerSeat: player.seatIndex, bidType },
        });
        if (newState.phase === 'DOG_REVEAL') {
            const revealedState = (0, tarotEngine_1.revealDog)(newState);
            tableGames.set(client.tableId, revealedState);
            broadcastGameState(client.tableId, revealedState);
            executeBotTurn(client.tableId, revealedState);
        }
        else if (newState.phase === 'END') {
            broadcastToTable(client.tableId, {
                type: 'GAME_PHASE_CHANGE',
                payload: { phase: 'END' },
            });
        }
        else {
            broadcastGameState(client.tableId, newState);
            executeBotTurn(client.tableId, newState);
        }
    }
    catch (error) {
        sendError(ws, error.message);
    }
}
function handlePlayCard(ws, payload) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    const { cardId } = payload;
    if (!cardId) {
        sendError(ws, 'Missing card ID');
        return;
    }
    const gameState = tableGames.get(client.tableId);
    if (!gameState)
        return;
    const player = gameState.players.find(p => p.userId === client.userId);
    if (!player)
        return;
    try {
        const newState = (0, tarotEngine_1.playCard)(gameState, player.seatIndex, cardId);
        tableGames.set(client.tableId, newState);
        broadcastToTable(client.tableId, {
            type: 'CARD_PLAYED',
            payload: { playerSeat: player.seatIndex, cardId },
        });
        if (newState.currentTrick.length === 0 && newState.completedTricks.length > gameState.completedTricks.length) {
            broadcastToTable(client.tableId, {
                type: 'TRICK_COMPLETE',
                payload: {
                    trick: newState.completedTricks[newState.completedTricks.length - 1]
                },
            });
        }
        if (newState.phase === 'SCORING') {
            const scores = (0, tarotEngine_1.calculateScores)(newState);
            newState.scores = scores;
            tableGames.set(client.tableId, newState);
            broadcastToTable(client.tableId, {
                type: 'GAME_PHASE_CHANGE',
                payload: { phase: 'SCORING', scores },
            });
        }
        broadcastGameState(client.tableId, newState);
        executeBotTurn(client.tableId, newState);
    }
    catch (error) {
        sendError(ws, error.message);
    }
}
async function startGame(tableId, players) {
    try {
        const distribution = (0, distributionSeeder_1.generateNewDistribution)();
        const { data: distData, error: distError } = await supabase_1.supabase
            .from('card_distributions')
            .insert({
            distribution_number: distribution.metadata.distributionNumber.toString(),
            sequence_number: distribution.metadata.sequenceNumber.toString(),
            hash_code: distribution.metadata.hashCode,
            deck_order: distribution.metadata.deckOrder,
            used_count: 0,
        })
            .select()
            .single();
        if (distError) {
            console.error('Error creating distribution:', distError);
            console.error('Error details:', JSON.stringify(distError, null, 2));
            return;
        }
        const sortedHands = {};
        for (let i = 0; i < 4; i++) {
            sortedHands[i] = (0, distributionSeeder_1.sortHand)(distribution.hands[i]);
        }
        const gameState = (0, tarotEngine_1.createInitialState)(players, sortedHands, distribution.dog);
        tableGames.set(tableId, gameState);
        const biddingState = (0, tarotEngine_1.startBidding)(gameState);
        tableGames.set(tableId, biddingState);
        broadcastToTable(tableId, {
            type: 'DISTRIBUTION_INFO',
            payload: {
                hashCode: distribution.metadata.hashCode,
                distributionNumber: distribution.metadata.distributionNumber.toString(),
                sequenceNumber: distribution.metadata.sequenceNumber.toString(),
            },
        });
        broadcastGameState(tableId, biddingState);
        broadcastToTable(tableId, {
            type: 'GAME_PHASE_CHANGE',
            payload: { phase: 'BIDDING' },
        });
        const { error: gameError } = await supabase_1.supabase
            .from('games')
            .insert({
            table_id: tableId,
            status: 'BIDDING',
            current_dealer_seat: 0,
            current_player_seat: 1,
            distribution_id: distData.id,
            game_state: biddingState,
        });
        if (gameError) {
            console.error('Error creating game:', gameError);
            console.error('Error details:', JSON.stringify(gameError, null, 2));
        }
        await supabase_1.supabase
            .from('card_distributions')
            .update({ used_count: 1 })
            .eq('id', distData.id);
        executeBotTurn(tableId, biddingState);
    }
    catch (error) {
        console.error('Error in startGame:', error);
    }
}
function handleDisconnect(ws) {
    const client = clients.get(ws);
    if (client && client.tableId) {
        handleLeaveTable(ws);
    }
    clients.delete(ws);
}
function sendMessage(ws, message) {
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
function sendError(ws, message) {
    sendMessage(ws, { type: 'ERROR', payload: { message } });
}
function sendGameState(ws, gameState) {
    const client = clients.get(ws);
    if (!client)
        return;
    const player = gameState.players.find(p => p.userId === client.userId);
    if (!player)
        return;
    const sanitizedState = {
        ...gameState,
        hands: {
            [player.seatIndex]: gameState.hands[player.seatIndex],
        },
    };
    sendMessage(ws, {
        type: 'GAME_STATE',
        payload: sanitizedState,
    });
}
function broadcastGameState(tableId, gameState) {
    clients.forEach((client) => {
        if (client.tableId === tableId) {
            sendGameState(client.ws, gameState);
        }
    });
}
function broadcastToTable(tableId, message) {
    clients.forEach((client) => {
        if (client.tableId === tableId) {
            sendMessage(client.ws, message);
        }
    });
}
async function handleAddBot(ws, payload) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    const { difficulty } = payload;
    if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        sendError(ws, 'Invalid difficulty level');
        return;
    }
    const players = tablePlayers.get(client.tableId) || [];
    if (players.length >= 4) {
        sendError(ws, 'Table is full');
        return;
    }
    const availableSeats = [0, 1, 2, 3].filter(seat => !players.some(p => p.seatIndex === seat));
    if (availableSeats.length === 0) {
        sendError(ws, 'No available seats');
        return;
    }
    const seatIndex = availableSeats[0];
    const bot = (0, botPlayer_1.createBotPlayer)(seatIndex, difficulty);
    console.log('[ADD_BOT] Creating bot:', {
        userId: bot.userId,
        displayName: bot.displayName,
        seatIndex,
        difficulty
    });
    try {
        const { error: userError } = await supabase_1.supabase
            .from('users')
            .insert({
            id: bot.userId,
            display_name: bot.displayName,
            is_guest: false,
            email: null,
        });
        if (userError) {
            console.log('[ADD_BOT] User insert result:', {
                code: userError.code,
                message: userError.message,
                details: userError.details
            });
        }
        if (userError && userError.code !== '23505') {
            console.error('[ADD_BOT] Error creating bot user:', userError);
            console.error('[ADD_BOT] Error details:', JSON.stringify(userError, null, 2));
            sendError(ws, `Failed to create bot user: ${userError.message}`);
            return;
        }
        else {
            console.log('[ADD_BOT] Bot user created successfully (or already exists)');
        }
        const { error } = await supabase_1.supabase
            .from('table_players')
            .insert({
            table_id: client.tableId,
            user_id: bot.userId,
            seat_index: seatIndex,
            is_ready: true,
        });
        if (error) {
            console.error('[ADD_BOT] Error adding bot to table_players:', error);
            console.error('[ADD_BOT] Error details:', JSON.stringify(error, null, 2));
            sendError(ws, `Failed to add bot to table: ${error.message}`);
            return;
        }
        console.log('[ADD_BOT] Bot added to table_players successfully');
        players.push(bot);
        tablePlayers.set(client.tableId, players);
        console.log('[ADD_BOT] Players count after adding bot:', players.length);
        broadcastToTable(client.tableId, {
            type: 'BOT_ADDED',
            payload: { player: bot },
        });
        broadcastToTable(client.tableId, {
            type: 'TABLE_STATE',
            payload: {
                tableId: client.tableId,
                players,
            },
        });
        if (players.length === 4 && players.every(p => p.isReady)) {
            setTimeout(() => startGame(client.tableId, players), 1000);
        }
    }
    catch (error) {
        console.error('Error in handleAddBot:', error);
        sendError(ws, 'Failed to add bot');
    }
}
async function handleRemoveBot(ws, payload) {
    const client = clients.get(ws);
    if (!client || !client.tableId)
        return;
    const { botId } = payload;
    if (!botId) {
        sendError(ws, 'Missing bot ID');
        return;
    }
    const players = tablePlayers.get(client.tableId) || [];
    const botPlayer = players.find(p => p.userId === botId && p.isBot);
    if (!botPlayer) {
        sendError(ws, 'Bot not found');
        return;
    }
    const gameState = tableGames.get(client.tableId);
    if (gameState && gameState.phase !== 'DEALING') {
        sendError(ws, 'Cannot remove bot during active game');
        return;
    }
    try {
        const { error } = await supabase_1.supabase
            .from('table_players')
            .delete()
            .eq('table_id', client.tableId)
            .eq('user_id', botId);
        if (error) {
            console.error('Error removing bot from database:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        }
        const filteredPlayers = players.filter(p => p.userId !== botId);
        tablePlayers.set(client.tableId, filteredPlayers);
        broadcastToTable(client.tableId, {
            type: 'BOT_REMOVED',
            payload: { botId },
        });
        broadcastToTable(client.tableId, {
            type: 'TABLE_STATE',
            payload: {
                tableId: client.tableId,
                players: filteredPlayers,
            },
        });
    }
    catch (error) {
        console.error('Error in handleRemoveBot:', error);
        sendError(ws, 'Failed to remove bot');
    }
}
function executeBotTurn(tableId, gameState) {
    const currentPlayer = gameState.players.find(p => p.seatIndex === gameState.currentPlayerSeat);
    if (!currentPlayer || !currentPlayer.isBot)
        return;
    setTimeout(() => {
        const updatedGameState = tableGames.get(tableId);
        if (!updatedGameState)
            return;
        if (updatedGameState.phase === 'BIDDING') {
            const currentHighestBid = updatedGameState.bids.length > 0
                ? updatedGameState.bids.reduce((highest, bid) => bid.bidType !== 'PASS' ? bid : highest).bidType
                : null;
            const hand = updatedGameState.hands[currentPlayer.seatIndex];
            const bidDecision = (0, botPlayer_1.decideBid)(hand, currentPlayer.difficulty, currentHighestBid);
            try {
                const newState = (0, tarotEngine_1.applyBid)(updatedGameState, currentPlayer.seatIndex, bidDecision);
                tableGames.set(tableId, newState);
                broadcastToTable(tableId, {
                    type: 'BID_PLACED',
                    payload: { playerSeat: currentPlayer.seatIndex, bidType: bidDecision },
                });
                if (newState.phase === 'DOG_REVEAL') {
                    const revealedState = (0, tarotEngine_1.revealDog)(newState);
                    tableGames.set(tableId, revealedState);
                    broadcastGameState(tableId, revealedState);
                    executeBotTurn(tableId, revealedState);
                }
                else if (newState.phase === 'END') {
                    broadcastToTable(tableId, {
                        type: 'GAME_PHASE_CHANGE',
                        payload: { phase: 'END' },
                    });
                }
                else {
                    broadcastGameState(tableId, newState);
                    executeBotTurn(tableId, newState);
                }
            }
            catch (error) {
                console.error('Bot bid error:', error.message);
            }
        }
        else if (updatedGameState.phase === 'PLAYING') {
            const cardToPlay = (0, botPlayer_1.chooseCardToPlay)(updatedGameState, currentPlayer.seatIndex, currentPlayer.difficulty);
            if (cardToPlay) {
                try {
                    const newState = (0, tarotEngine_1.playCard)(updatedGameState, currentPlayer.seatIndex, cardToPlay);
                    tableGames.set(tableId, newState);
                    broadcastToTable(tableId, {
                        type: 'CARD_PLAYED',
                        payload: { playerSeat: currentPlayer.seatIndex, cardId: cardToPlay },
                    });
                    if (newState.currentTrick.length === 0 && newState.completedTricks.length > updatedGameState.completedTricks.length) {
                        broadcastToTable(tableId, {
                            type: 'TRICK_COMPLETE',
                            payload: {
                                trick: newState.completedTricks[newState.completedTricks.length - 1]
                            },
                        });
                    }
                    if (newState.phase === 'SCORING') {
                        const scores = (0, tarotEngine_1.calculateScores)(newState);
                        newState.scores = scores;
                        tableGames.set(tableId, newState);
                        broadcastToTable(tableId, {
                            type: 'GAME_PHASE_CHANGE',
                            payload: { phase: 'SCORING', scores },
                        });
                    }
                    broadcastGameState(tableId, newState);
                    executeBotTurn(tableId, newState);
                }
                catch (error) {
                    console.error('Bot play error:', error.message);
                }
            }
        }
    }, 1000);
}
const PORT = process.env.WS_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
