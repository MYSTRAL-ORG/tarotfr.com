'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WSServerMessage, WSClientMessage, TarotGameState, Player, BidType } from '@/lib/types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface DistributionInfo {
  hashCode: string;
  distributionNumber: string;
  sequenceNumber: string;
}

interface WebSocketContextType {
  status: ConnectionStatus;
  gameState: TarotGameState | null;
  players: Player[];
  tableId: string | null;
  distributionInfo: DistributionInfo | null;
  joinTable: (tableId: string, userId: string, displayName: string) => void;
  leaveTable: () => void;
  ready: () => void;
  placeBid: (bidType: BidType) => void;
  playCard: (cardId: string) => void;
  addBot: (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => void;
  removeBot: (botId: string) => void;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [gameState, setGameState] = useState<TarotGameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [distributionInfo, setDistributionInfo] = useState<DistributionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setStatus('connecting');
      const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setStatus('connected');
      setError(null);
      reconnectAttemptsRef.current = 0;

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const message: WSServerMessage = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (error) {
        console.error('Error parsing server message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Connection error');
    };

    ws.onclose = () => {
      setStatus('disconnected');

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      const maxReconnectAttempts = 5;
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        setStatus('reconnecting');

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setStatus('disconnected');
      setError('Failed to connect to game server');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const handleServerMessage = (message: WSServerMessage) => {
    switch (message.type) {
      case 'TABLE_STATE':
        setTableId(message.payload.tableId);
        setPlayers(message.payload.players);
        break;

      case 'GAME_STATE':
        setGameState(message.payload);
        break;

      case 'PLAYER_JOINED':
        setPlayers(prev => {
          const exists = prev.some(p => p.userId === message.payload.player.userId);
          if (exists) return prev;
          return [...prev, message.payload.player];
        });
        break;

      case 'PLAYER_LEFT':
        setPlayers(prev => prev.filter(p => p.userId !== message.payload.userId));
        break;

      case 'PLAYER_READY':
        setPlayers(prev =>
          prev.map(p =>
            p.userId === message.payload.userId ? { ...p, isReady: true } : p
          )
        );
        break;

      case 'BOT_ADDED':
        setPlayers(prev => {
          const exists = prev.some(p => p.userId === message.payload.player.userId);
          if (exists) return prev;
          return [...prev, message.payload.player];
        });
        break;

      case 'BOT_REMOVED':
        setPlayers(prev => prev.filter(p => p.userId !== message.payload.botId));
        break;

      case 'BID_PLACED':
        break;

      case 'CARD_PLAYED':
        break;

      case 'TRICK_COMPLETE':
        break;

      case 'DISTRIBUTION_INFO':
        setDistributionInfo({
          hashCode: message.payload.hashCode,
          distributionNumber: message.payload.distributionNumber,
          sequenceNumber: message.payload.sequenceNumber,
        });
        break;

      case 'GAME_PHASE_CHANGE':
        if (gameState) {
          setGameState({ ...gameState, phase: message.payload.phase });
        }
        break;

      case 'ROUND_END':
        window.dispatchEvent(new CustomEvent('roundEnd', { detail: message.payload }));
        break;

      case 'ROUND_START':
        window.dispatchEvent(new CustomEvent('roundStart', { detail: message.payload }));
        break;

      case 'GAME_OVER':
        window.dispatchEvent(new CustomEvent('gameOver', { detail: message.payload }));
        break;

      case 'ERROR':
        setError(message.payload.message);
        setTimeout(() => setError(null), 5000);
        break;

      case 'PONG':
        break;

      default:
        }
  };

  const sendMessage = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError('Not connected to server');
    }
  }, []);

  const joinTable = useCallback((tableId: string, userId: string, displayName: string) => {
    sendMessage({
      type: 'JOIN_TABLE',
      payload: { tableId, userId, displayName },
    });
  }, [sendMessage]);

  const leaveTable = useCallback(() => {
    sendMessage({ type: 'LEAVE_TABLE' });
    setTableId(null);
    setGameState(null);
    setPlayers([]);
  }, [sendMessage]);

  const ready = useCallback(() => {
    sendMessage({ type: 'READY' });
  }, [sendMessage]);

  const placeBid = useCallback((bidType: BidType) => {
    sendMessage({
      type: 'BID',
      payload: { bidType },
    });
  }, [sendMessage]);

  const playCard = useCallback((cardId: string) => {
    sendMessage({
      type: 'PLAY_CARD',
      payload: { cardId },
    });
  }, [sendMessage]);

  const addBot = useCallback((difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    sendMessage({
      type: 'ADD_BOT',
      payload: { difficulty },
    });
  }, [sendMessage]);

  const removeBot = useCallback((botId: string) => {
    sendMessage({
      type: 'REMOVE_BOT',
      payload: { botId },
    });
  }, [sendMessage]);

  return (
    <WebSocketContext.Provider
      value={{
        status,
        gameState,
        players,
        tableId,
        distributionInfo,
        joinTable,
        leaveTable,
        ready,
        placeBid,
        playCard,
        addBot,
        removeBot,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
