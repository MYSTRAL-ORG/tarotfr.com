import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import {
  WSClientMessage,
  WSServerMessage,
  TarotGameState,
  BidType,
  Player,
} from '../lib/types';
import {
  createInitialState,
  applyBid,
  playCard,
  startBidding,
  revealDog,
  calculateScores,
  finishRound,
  startNextRound,
  clearTrick,
} from '../lib/tarotEngine';
import {
  createBotPlayer,
  decideBid,
  chooseCardToPlay,
  BotDifficulty,
} from '../lib/botPlayer';
import { generateNewDistribution, sortHand } from '../lib/distributionSeeder';
import { supabase } from '../lib/supabase';

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  tableId: string | null;
  displayName: string;
}

const clients = new Map<WebSocket, ConnectedClient>();
const tableGames = new Map<string, TarotGameState>();
const tablePlayers = new Map<string, Player[]>();

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  ws.on('message', async (data: Buffer) => {
    try {
      const message: WSClientMessage = JSON.parse(data.toString());
      await handleClientMessage(ws, message);
    } catch (error) {
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

async function handleClientMessage(ws: WebSocket, message: WSClientMessage) {
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

async function handleJoinTable(ws: WebSocket, payload: any) {
  const { tableId, userId, displayName } = payload;

  console.log('[JOIN_TABLE] Request received:', { tableId, userId, displayName });

  if (!tableId || !userId || !displayName) {
    sendError(ws, 'Missing required fields');
    return;
  }

  const client: ConnectedClient = {
    ws,
    userId,
    tableId,
    displayName,
  };

  clients.set(ws, client);
  console.log('[JOIN_TABLE] Client registered, total clients:', clients.size);

  try {
    await supabase
      .from('table_players')
      .update({ is_ready: true })
      .eq('table_id', tableId)
      .eq('user_id', userId);

    const { data: dbPlayers, error } = await supabase
      .from('table_players')
      .select('*, users!inner(id, display_name)')
      .eq('table_id', tableId)
      .order('seat_index', { ascending: true });

    console.log('[JOIN_TABLE] DB players fetched:', dbPlayers?.length || 0, 'players');

    if (error) {
      console.error('Error fetching players from DB:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      sendError(ws, 'Failed to load table players');
      return;
    }

    const players: Player[] = (dbPlayers || []).map((dbPlayer: any) => ({
      id: dbPlayer.user_id,
      userId: dbPlayer.user_id,
      displayName: dbPlayer.users.display_name,
      seatIndex: dbPlayer.seat_index,
      isReady: true,
    }));

    tablePlayers.set(tableId, players);
    console.log('[JOIN_TABLE] Players mapped and stored:', players.map(p => `${p.displayName}(${p.userId})`).join(', '));

    sendMessage(ws, {
      type: 'TABLE_STATE',
      payload: {
        tableId,
        players,
      },
    });
    console.log('[JOIN_TABLE] Sent TABLE_STATE to joining player with', players.length, 'players');

    const clientsInTable = Array.from(clients.values()).filter(c => c.tableId === tableId);
    console.log('[JOIN_TABLE] Clients in table before broadcast:', clientsInTable.length, '-', clientsInTable.map(c => c.displayName).join(', '));

    broadcastToTable(tableId, {
      type: 'PLAYER_JOINED',
      payload: { player: players.find(p => p.userId === userId) },
    });

    broadcastToTable(tableId, {
      type: 'TABLE_STATE',
      payload: {
        tableId,
        players,
      },
    });
    console.log('[JOIN_TABLE] Broadcasted updates to', clientsInTable.length, 'clients');

    const gameState = tableGames.get(tableId);
    if (gameState) {
      console.log('[JOIN] Game already started, sending game state to new player');
      sendGameState(ws, gameState);
    } else if (players.length === 4) {
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
        } else {
          console.log('[AUTO-START] Conditions not met, aborting');
        }
      }, 2000);
    } else {
      console.log(`[JOIN] Waiting for more players (${players.length}/4)`);
    }
  } catch (error) {
    console.error('Error in handleJoinTable:', error);
    sendError(ws, 'Failed to join table');
  }
}

function handleLeaveTable(ws: WebSocket) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

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

async function handleReady(ws: WebSocket) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

  try {
    const { error } = await supabase
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
    if (!player) return;

    player.isReady = true;
    tablePlayers.set(client.tableId, players);

    broadcastToTable(client.tableId, {
      type: 'PLAYER_READY',
      payload: { userId: client.userId },
    });

    if (players.length === 4 && players.every(p => p.isReady)) {
      await startGame(client.tableId, players);
    }
  } catch (error) {
    console.error('Error in handleReady:', error);
    sendError(ws, 'Failed to set ready status');
  }
}

function handleBid(ws: WebSocket, payload: any) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

  const { bidType } = payload;
  if (!bidType) {
    sendError(ws, 'Missing bid type');
    return;
  }

  const gameState = tableGames.get(client.tableId);
  if (!gameState) return;

  const player = gameState.players.find(p => p.userId === client.userId);
  if (!player) return;

  if (gameState.phase !== 'BIDDING') {
    sendError(ws, 'Not in bidding phase');
    return;
  }

  if (gameState.currentPlayerSeat !== player.seatIndex) {
    sendError(ws, 'Not your turn');
    return;
  }

  try {
    const newState = applyBid(gameState, player.seatIndex, bidType as BidType);
    tableGames.set(client.tableId, newState);

    broadcastToTable(client.tableId, {
      type: 'BID_PLACED',
      payload: { playerSeat: player.seatIndex, bidType },
    });

    if (newState.phase === 'DOG_REVEAL') {
      const revealedState = revealDog(newState);
      tableGames.set(client.tableId, revealedState);
      broadcastGameState(client.tableId, revealedState);
      executeBotTurn(client.tableId, revealedState);
    } else if (newState.phase === 'END') {
      broadcastToTable(client.tableId, {
        type: 'GAME_PHASE_CHANGE',
        payload: { phase: 'END' },
      });
    } else {
      broadcastGameState(client.tableId, newState);
      executeBotTurn(client.tableId, newState);
    }
  } catch (error: any) {
    sendError(ws, error.message);
  }
}

function handlePlayCard(ws: WebSocket, payload: any) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

  const { cardId } = payload;
  if (!cardId) {
    sendError(ws, 'Missing card ID');
    return;
  }

  const gameState = tableGames.get(client.tableId);
  if (!gameState) return;

  const player = gameState.players.find(p => p.userId === client.userId);
  if (!player) return;

  try {
    const newState = playCard(gameState, player.seatIndex, cardId);
    const trickJustCompleted = newState.currentTrick.length === 4 && newState.currentTrickWinner !== null;

    tableGames.set(client.tableId, newState);

    broadcastToTable(client.tableId, {
      type: 'CARD_PLAYED',
      payload: { playerSeat: player.seatIndex, cardId },
    });

    broadcastGameState(client.tableId, newState);

    if (trickJustCompleted && client.tableId) {
      const tableId = client.tableId;
      setTimeout(() => {
        const currentState = tableGames.get(tableId);
        if (!currentState || currentState.currentTrick.length !== 4) return;

        const clearedState = clearTrick(currentState);
        tableGames.set(tableId, clearedState);

        broadcastToTable(tableId, {
          type: 'TRICK_COMPLETE',
          payload: {
            trick: clearedState.completedTricks[clearedState.completedTricks.length - 1]
          },
        });

        if (clearedState.phase === 'SCORING') {
          const { state: scoringState, contractWon } = finishRound(clearedState);
          tableGames.set(tableId, scoringState);

          broadcastToTable(tableId, {
            type: 'ROUND_END',
            payload: {
              phase: 'SCORING',
              roundNumber: scoringState.currentRound,
              scores: scoringState.scores,
              totalScores: scoringState.totalScores,
              contractWon,
              isGameOver: scoringState.currentRound >= 3,
            },
          });

          broadcastGameState(tableId, scoringState);

          if (scoringState.currentRound >= 3) {
            broadcastToTable(tableId, {
              type: 'GAME_OVER',
              payload: {
                finalScores: scoringState.totalScores,
                roundScores: scoringState.roundScores,
              },
            });
            return;
          }

          setTimeout(() => {
            handleNextRound(tableId);
          }, 5000);
          return;
        }

        broadcastGameState(tableId, clearedState);
        executeBotTurn(tableId, clearedState);
      }, 3500);
      return;
    }

    executeBotTurn(client.tableId, newState);
  } catch (error: any) {
    sendError(ws, error.message);
  }
}

async function startGame(tableId: string, players: Player[]) {
  try {
    const distribution = generateNewDistribution();

    const { data: distData, error: distError } = await supabase
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

    const sortedHands: Record<number, any> = {};
    for (let i = 0; i < 4; i++) {
      sortedHands[i] = sortHand(distribution.hands[i]);
    }

    const gameState = createInitialState(players, sortedHands, distribution.dog);
    tableGames.set(tableId, gameState);

    const biddingState = startBidding(gameState);
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

    const { error: gameError } = await supabase
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

    await supabase
      .from('card_distributions')
      .update({ used_count: 1 })
      .eq('id', distData.id);

    executeBotTurn(tableId, biddingState);
  } catch (error) {
    console.error('Error in startGame:', error);
  }
}

async function handleNextRound(tableId: string) {
  try {
    const currentState = tableGames.get(tableId);
    if (!currentState) return;

    const distribution = generateNewDistribution();

    const sortedHands: Record<number, any> = {};
    for (let i = 0; i < 4; i++) {
      sortedHands[i] = sortHand(distribution.hands[i]);
    }

    const nextRoundState = startNextRound(currentState, sortedHands, distribution.dog);
    tableGames.set(tableId, nextRoundState);

    const biddingState = startBidding(nextRoundState);
    tableGames.set(tableId, biddingState);

    broadcastToTable(tableId, {
      type: 'ROUND_START',
      payload: {
        roundNumber: biddingState.currentRound,
      },
    });

    broadcastGameState(tableId, biddingState);
    broadcastToTable(tableId, {
      type: 'GAME_PHASE_CHANGE',
      payload: { phase: 'BIDDING' },
    });

    executeBotTurn(tableId, biddingState);
  } catch (error) {
    console.error('Error in handleNextRound:', error);
  }
}

function handleDisconnect(ws: WebSocket) {
  const client = clients.get(ws);
  if (client && client.tableId) {
    handleLeaveTable(ws);
  }
  clients.delete(ws);
}

function sendMessage(ws: WebSocket, message: WSServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, message: string) {
  sendMessage(ws, { type: 'ERROR', payload: { message } });
}

function sendGameState(ws: WebSocket, gameState: TarotGameState) {
  const client = clients.get(ws);
  if (!client) return;

  const player = gameState.players.find(p => p.userId === client.userId);
  if (!player) return;

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

function broadcastGameState(tableId: string, gameState: TarotGameState) {
  clients.forEach((client) => {
    if (client.tableId === tableId) {
      sendGameState(client.ws, gameState);
    }
  });
}

function broadcastToTable(tableId: string, message: WSServerMessage) {
  clients.forEach((client) => {
    if (client.tableId === tableId) {
      sendMessage(client.ws, message);
    }
  });
}

async function handleAddBot(ws: WebSocket, payload: any) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

  const { difficulty } = payload;
  if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
    sendError(ws, 'Invalid difficulty level');
    return;
  }

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const { data: existingPlayers, error: fetchError } = await supabase
        .from('table_players')
        .select('seat_index')
        .eq('table_id', client.tableId);

      if (fetchError) {
        console.error('[ADD_BOT] Error fetching existing players:', fetchError);
        sendError(ws, 'Failed to check available seats');
        return;
      }

      const occupiedSeats = (existingPlayers || []).map(p => p.seat_index);

      if (occupiedSeats.length >= 4) {
        sendError(ws, 'Table is full');
        return;
      }

      const availableSeats = [0, 1, 2, 3].filter(
        seat => !occupiedSeats.includes(seat)
      );

      if (availableSeats.length === 0) {
        sendError(ws, 'No available seats');
        return;
      }

      const seatIndex = availableSeats[0];
      const bot = createBotPlayer(seatIndex, difficulty as BotDifficulty);

      console.log('[ADD_BOT] Attempt', attempts + 1, 'Creating bot:', {
        userId: bot.userId,
        displayName: bot.displayName,
        seatIndex,
        difficulty,
        occupiedSeats
      });

      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: bot.userId,
          display_name: bot.displayName,
          is_guest: false,
          is_bot: true,
          email: null,
        });

      if (userError && userError.code !== '23505') {
        console.error('[ADD_BOT] Error creating bot user:', userError);
        sendError(ws, `Failed to create bot user: ${userError.message}`);
        return;
      }

      const { error } = await supabase
        .from('table_players')
        .insert({
          table_id: client.tableId,
          user_id: bot.userId,
          seat_index: seatIndex,
          is_ready: true,
        });

      if (error && error.code === '23505') {
        console.log('[ADD_BOT] Seat conflict detected, retrying with next available seat...');
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      if (error) {
        console.error('[ADD_BOT] Error adding bot to table_players:', error);
        sendError(ws, `Failed to add bot to table: ${error.message}`);
        return;
      }

      console.log('[ADD_BOT] Bot added to table_players successfully');

      const players = tablePlayers.get(client.tableId) || [];
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
        setTimeout(() => startGame(client.tableId!, players), 1000);
      }

      return;
    } catch (error) {
      console.error('Error in handleAddBot:', error);
      if (attempts >= maxAttempts - 1) {
        sendError(ws, 'Failed to add bot after multiple attempts');
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  sendError(ws, 'Failed to add bot: maximum attempts reached');
}

async function handleRemoveBot(ws: WebSocket, payload: any) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

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
    const { error } = await supabase
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
  } catch (error) {
    console.error('Error in handleRemoveBot:', error);
    sendError(ws, 'Failed to remove bot');
  }
}

function executeBotTurn(tableId: string, gameState: TarotGameState) {
  const currentPlayer = gameState.players.find(
    p => p.seatIndex === gameState.currentPlayerSeat
  );

  if (!currentPlayer || !currentPlayer.isBot) return;

  setTimeout(() => {
    const updatedGameState = tableGames.get(tableId);
    if (!updatedGameState) return;

    const currentPlayerInUpdatedState = updatedGameState.players.find(
      p => p.seatIndex === updatedGameState.currentPlayerSeat
    );

    if (!currentPlayerInUpdatedState || !currentPlayerInUpdatedState.isBot) return;
    if (currentPlayerInUpdatedState.seatIndex !== currentPlayer.seatIndex) return;

    if (updatedGameState.phase === 'BIDDING') {
      const currentHighestBid = updatedGameState.bids.length > 0
        ? updatedGameState.bids.reduce((highest, bid) =>
            bid.bidType !== 'PASS' ? bid : highest
          ).bidType
        : null;

      const hand = updatedGameState.hands[currentPlayerInUpdatedState.seatIndex];
      const bidDecision = decideBid(
        hand,
        currentPlayerInUpdatedState.difficulty!,
        currentHighestBid
      );

      try {
        const newState = applyBid(updatedGameState, currentPlayerInUpdatedState.seatIndex, bidDecision);
        tableGames.set(tableId, newState);

        broadcastToTable(tableId, {
          type: 'BID_PLACED',
          payload: { playerSeat: currentPlayerInUpdatedState.seatIndex, bidType: bidDecision },
        });

        if (newState.phase === 'DOG_REVEAL') {
          const revealedState = revealDog(newState);
          tableGames.set(tableId, revealedState);
          broadcastGameState(tableId, revealedState);
          executeBotTurn(tableId, revealedState);
        } else if (newState.phase === 'END') {
          broadcastToTable(tableId, {
            type: 'GAME_PHASE_CHANGE',
            payload: { phase: 'END' },
          });
        } else {
          broadcastGameState(tableId, newState);
          executeBotTurn(tableId, newState);
        }
      } catch (error: any) {
        console.error('Bot bid error:', error.message);
      }
    } else if (updatedGameState.phase === 'PLAYING') {
      const cardToPlay = chooseCardToPlay(
        updatedGameState,
        currentPlayerInUpdatedState.seatIndex,
        currentPlayerInUpdatedState.difficulty!
      );

      if (cardToPlay) {
        try {
          const newState = playCard(updatedGameState, currentPlayerInUpdatedState.seatIndex, cardToPlay);
          const trickJustCompleted = newState.currentTrick.length === 4 && newState.currentTrickWinner !== null;

          tableGames.set(tableId, newState);

          broadcastToTable(tableId, {
            type: 'CARD_PLAYED',
            payload: { playerSeat: currentPlayerInUpdatedState.seatIndex, cardId: cardToPlay },
          });

          broadcastGameState(tableId, newState);

          if (trickJustCompleted) {
            setTimeout(() => {
              const currentState = tableGames.get(tableId);
              if (!currentState || currentState.currentTrick.length !== 4) return;

              const clearedState = clearTrick(currentState);
              tableGames.set(tableId, clearedState);

              broadcastToTable(tableId, {
                type: 'TRICK_COMPLETE',
                payload: {
                  trick: clearedState.completedTricks[clearedState.completedTricks.length - 1]
                },
              });

              if (clearedState.phase === 'SCORING') {
                const { state: scoringState, contractWon } = finishRound(clearedState);
                tableGames.set(tableId, scoringState);

                broadcastToTable(tableId, {
                  type: 'ROUND_END',
                  payload: {
                    phase: 'SCORING',
                    roundNumber: scoringState.currentRound,
                    scores: scoringState.scores,
                    totalScores: scoringState.totalScores,
                    contractWon,
                    isGameOver: scoringState.currentRound >= 3,
                  },
                });

                broadcastGameState(tableId, scoringState);

                if (scoringState.currentRound >= 3) {
                  broadcastToTable(tableId, {
                    type: 'GAME_OVER',
                    payload: {
                      finalScores: scoringState.totalScores,
                      roundScores: scoringState.roundScores,
                    },
                  });
                  return;
                }

                setTimeout(() => {
                  handleNextRound(tableId);
                }, 5000);
                return;
              }

              broadcastGameState(tableId, clearedState);
              executeBotTurn(tableId, clearedState);
            }, 3500);
            return;
          }

          executeBotTurn(tableId, newState);
        } catch (error: any) {
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
