'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TarotCard } from '@/components/game/TarotCard';
import { PlayerSeat } from '@/components/game/PlayerSeat';
import { TrickArea } from '@/components/game/TrickArea';
import { GameStatusBar } from '@/components/game/GameStatusBar';
import { BiddingPanel } from '@/components/game/BiddingPanel';
import { BotSelector } from '@/components/game/BotSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { BidType, Player } from '@/lib/types';
import { toast } from 'sonner';
import { ArrowLeft, Bot } from 'lucide-react';
import { DistributionCode } from '@/components/game/DistributionCode';

export default function TablePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    status,
    gameState,
    players,
    distributionInfo,
    joinTable,
    ready,
    placeBid,
    playCard,
    addBot,
    removeBot,
    error,
  } = useWebSocket();

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const tableId = params.id as string;

  useEffect(() => {
    if (user && tableId && !hasJoined && status === 'connected') {
      joinTable(tableId, user.id, user.displayName);
      setHasJoined(true);
    }
  }, [user, tableId, joinTable, hasJoined, status]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const currentPlayer = players.find(p => p.userId === user?.id);
  const otherPlayers = players.filter(p => p.userId !== user?.id);

  const getPlayerAtPosition = (position: 'top' | 'left' | 'right'): Player | null => {
    if (!currentPlayer) return null;

    const positionMap = {
      top: (currentPlayer.seatIndex + 2) % 4,
      left: (currentPlayer.seatIndex + 1) % 4,
      right: (currentPlayer.seatIndex + 3) % 4,
    };

    return players.find(p => p.seatIndex === positionMap[position]) || null;
  };

  const handleCardClick = (cardId: string) => {
    if (gameState?.phase !== 'PLAYING') return;
    if (gameState.currentPlayerSeat !== currentPlayer?.seatIndex) return;

    setSelectedCard(cardId);
    playCard(cardId);
  };

  const handleBid = (bidType: BidType) => {
    placeBid(bidType);
  };

  const handleReady = () => {
    ready();
  };

  const handleLeave = () => {
    router.push('/jouer');
  };

  const myHand = currentPlayer && gameState?.hands[currentPlayer.seatIndex];

  const isMyTurn = currentPlayer && gameState?.currentPlayerSeat === currentPlayer.seatIndex;

  const currentTurnPlayer = players.find(p => p.seatIndex === gameState?.currentPlayerSeat);

  const takerPlayer = gameState?.takerSeat !== null
    ? players.find(p => p.seatIndex === gameState?.takerSeat)
    : null;

  const availableBids: BidType[] = ['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'];

  return (
    <div className="min-h-screen game-table-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleLeave} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quitter la table
          </Button>

          {distributionInfo && (
            <DistributionCode
              hashCode={distributionInfo.hashCode}
              distributionNumber={distributionInfo.distributionNumber}
              sequenceNumber={distributionInfo.sequenceNumber}
            />
          )}
        </div>

        {status !== 'connected' && (
          <Card className="p-6 text-center mb-6">
            <p className="text-slate-600">
              {status === 'connecting' && 'Connexion au serveur...'}
              {status === 'reconnecting' && 'Reconnexion...'}
              {status === 'disconnected' && 'Déconnecté du serveur'}
            </p>
          </Card>
        )}

        {!gameState && players.length < 4 && (
          <Card className="p-8 text-center mb-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              En attente de joueurs
            </h2>
            <p className="text-slate-600 mb-4">
              {players.length} / 4 joueurs présents
            </p>
            {currentPlayer && !currentPlayer.isReady && (
              <Button onClick={handleReady}>Prêt</Button>
            )}
            {currentPlayer?.isReady && (
              <p className="text-green-600 font-semibold">Vous êtes prêt !</p>
            )}
          </Card>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {gameState && (
                <GameStatusBar
                  phase={gameState.phase}
                  contract={gameState.contract}
                  takerName={takerPlayer?.displayName || null}
                  currentPlayerName={currentTurnPlayer?.displayName || 'En attente'}
                />
              )}

              <div className="game-table-bg rounded-lg p-6 shadow-xl border border-green-600/50">
                <div className="flex justify-center mb-6">
                  <PlayerSeat
                    player={getPlayerAtPosition('top')}
                    position="top"
                    isCurrentPlayer={gameState?.currentPlayerSeat === getPlayerAtPosition('top')?.seatIndex}
                    cardCount={gameState && getPlayerAtPosition('top') ? gameState.hands[getPlayerAtPosition('top')!.seatIndex]?.length : undefined}
                  />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <PlayerSeat
                    player={getPlayerAtPosition('left')}
                    position="left"
                    isCurrentPlayer={gameState?.currentPlayerSeat === getPlayerAtPosition('left')?.seatIndex}
                    cardCount={gameState && getPlayerAtPosition('left') ? gameState.hands[getPlayerAtPosition('left')!.seatIndex]?.length : undefined}
                  />

                  <div className="flex-1 mx-6">
                    {gameState && gameState.currentTrick.length > 0 && (
                      <TrickArea cards={gameState.currentTrick} />
                    )}
                    {(!gameState || gameState.currentTrick.length === 0) && (
                      <div className="h-[200px] flex items-center justify-center">
                        <div className="w-48 h-32 rounded-lg border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center">
                          <span className="text-white/50 text-sm">
                            Zone de jeu
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <PlayerSeat
                    player={getPlayerAtPosition('right')}
                    position="right"
                    isCurrentPlayer={gameState?.currentPlayerSeat === getPlayerAtPosition('right')?.seatIndex}
                    cardCount={gameState && getPlayerAtPosition('right') ? gameState.hands[getPlayerAtPosition('right')!.seatIndex]?.length : undefined}
                  />
                </div>

                <div className="flex justify-center">
                  <PlayerSeat
                    player={currentPlayer || null}
                    position="bottom"
                    isCurrentPlayer={isMyTurn}
                  />
                </div>
              </div>

              {myHand && myHand.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">
                    Votre main
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {myHand.map((card) => (
                      <TarotCard
                        key={card.id}
                        card={card}
                        selectable={isMyTurn && gameState?.phase === 'PLAYING'}
                        selected={selectedCard === card.id}
                        onClick={() => handleCardClick(card.id)}
                        size="md"
                      />
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {gameState?.phase === 'BIDDING' && currentPlayer && (
                <BiddingPanel
                  onBid={handleBid}
                  isMyTurn={isMyTurn || false}
                  availableBids={availableBids}
                />
              )}

              {!gameState && (
                <BotSelector
                  players={players}
                  onAddBot={addBot}
                  onRemoveBot={removeBot}
                  disabled={false}
                />
              )}

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">
                  Joueurs
                </h3>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {player.isBot && (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-medium text-slate-900">
                          {player.displayName}
                          {player.userId === user?.id && ' (Vous)'}
                        </span>
                      </div>
                      {player.isReady && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Prêt
                        </span>
                      )}
                    </div>
                  ))}
                  {players.length < 4 && (
                    <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-sm">
                      En attente...
                    </div>
                  )}
                </div>
              </Card>

              {gameState?.scores && Object.keys(gameState.scores).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">
                    Scores
                  </h3>
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-700">{player.displayName}</span>
                        <span className="font-bold text-slate-900">
                          {gameState.scores[player.seatIndex] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
