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
} from '../lib/tarotEngine';

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

  ws.on('message', (data: Buffer) => {
    try {
      const message: WSClientMessage = JSON.parse(data.toString());
      handleClientMessage(ws, message);
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

function handleClientMessage(ws: WebSocket, message: WSClientMessage) {
  switch (message.type) {
    case 'JOIN_TABLE':
      handleJoinTable(ws, message.payload);
      break;
    case 'LEAVE_TABLE':
      handleLeaveTable(ws);
      break;
    case 'READY':
      handleReady(ws);
      break;
    case 'BID':
      handleBid(ws, message.payload);
      break;
    case 'PLAY_CARD':
      handlePlayCard(ws, message.payload);
      break;
    case 'PING':
      sendMessage(ws, { type: 'PONG' });
      break;
    default:
      sendError(ws, 'Unknown message type');
  }
}

function handleJoinTable(ws: WebSocket, payload: any) {
  const { tableId, userId, displayName } = payload;

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

  let players = tablePlayers.get(tableId) || [];

  const existingPlayer = players.find(p => p.userId === userId);
  if (!existingPlayer) {
    const seatIndex = players.length;
    if (seatIndex >= 4) {
      sendError(ws, 'Table is full');
      return;
    }

    const newPlayer: Player = {
      id: userId,
      userId,
      displayName,
      seatIndex,
      isReady: false,
    };

    players.push(newPlayer);
    tablePlayers.set(tableId, players);

    broadcastToTable(tableId, {
      type: 'PLAYER_JOINED',
      payload: { player: newPlayer },
    });
  }

  sendMessage(ws, {
    type: 'TABLE_STATE',
    payload: {
      tableId,
      players,
    },
  });

  const gameState = tableGames.get(tableId);
  if (gameState) {
    sendGameState(ws, gameState);
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

function handleReady(ws: WebSocket) {
  const client = clients.get(ws);
  if (!client || !client.tableId) return;

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
    startGame(client.tableId, players);
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
    } else if (newState.phase === 'END') {
      broadcastToTable(client.tableId, {
        type: 'GAME_PHASE_CHANGE',
        payload: { phase: 'END' },
      });
    } else {
      broadcastGameState(client.tableId, newState);
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
      const scores = calculateScores(newState);
      newState.scores = scores;
      tableGames.set(client.tableId, newState);

      broadcastToTable(client.tableId, {
        type: 'GAME_PHASE_CHANGE',
        payload: { phase: 'SCORING', scores },
      });
    }

    broadcastGameState(client.tableId, newState);
  } catch (error: any) {
    sendError(ws, error.message);
  }
}

function startGame(tableId: string, players: Player[]) {
  const gameState = createInitialState(players);
  tableGames.set(tableId, gameState);

  const biddingState = startBidding(gameState);
  tableGames.set(tableId, biddingState);

  broadcastGameState(tableId, biddingState);
  broadcastToTable(tableId, {
    type: 'GAME_PHASE_CHANGE',
    payload: { phase: 'BIDDING' },
  });
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

const PORT = process.env.WS_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
