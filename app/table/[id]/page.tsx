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
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { BidType, Player } from '@/lib/types';
import { toast } from 'sonner';
import { ArrowLeft, Bot, Trophy, Copy, Check } from 'lucide-react';
import { DistributionCode } from '@/components/game/DistributionCode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
  const [copiedDistrib, setCopiedDistrib] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [scoresOpen, setScoresOpen] = useState(false);

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

  const handleCopyDistribution = async () => {
    if (distributionInfo?.hashCode) {
      await navigator.clipboard.writeText(distributionInfo.hashCode);
      setCopiedDistrib(true);
      toast.success('Code de distribution copié !');
      setTimeout(() => setCopiedDistrib(false), 2000);
    }
  };

  const handleAddPartner = () => {
    addBot('HARD');
  };

  const handleCompleteTable = async () => {
    const emptySeats = 4 - players.length;
    for (let i = 0; i < emptySeats; i++) {
      addBot(selectedDifficulty);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const myHand = currentPlayer && gameState?.hands[currentPlayer.seatIndex];

  const isMyTurn = currentPlayer && gameState?.currentPlayerSeat === currentPlayer.seatIndex;

  const currentTurnPlayer = players.find(p => p.seatIndex === gameState?.currentPlayerSeat);

  const takerPlayer = gameState?.takerSeat !== null
    ? players.find(p => p.seatIndex === gameState?.takerSeat)
    : null;

  const availableBids: BidType[] = ['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleLeave} className="text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quitter
          </Button>

          <div className="flex gap-2">
            {gameState && (
              <Dialog open={scoresOpen} onOpenChange={setScoresOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Trophy className="w-4 h-4 mr-2" />
                    Scores
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Scores de la partie</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 mt-4">
                    {players.map((player) => (
                      <div
                        key={player.userId}
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
                        <span className="font-bold text-slate-900">
                          {gameState.scores[player.seatIndex] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {distributionInfo && (
              <Button
                variant="outline"
                onClick={handleCopyDistribution}
                disabled={copiedDistrib}
              >
                {copiedDistrib ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copiedDistrib ? 'Copié !' : 'Copier distrib'}
              </Button>
            )}
          </div>
        </div>


        <div className="max-w-6xl mx-auto">
          {!gameState ? (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Salle d'attente
              </h2>
              <p className="text-slate-600 mb-6">
                En attente des joueurs... ({players.length}/4)
              </p>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[0, 1, 2, 3].map((seatIndex) => {
                  const player = players.find(p => p.seatIndex === seatIndex);
                  const isPartnerSlot = currentPlayer && seatIndex === (currentPlayer.seatIndex + 2) % 4;
                  const canAddBots = players.length < 4;

                  if (player) {
                    return (
                      <Card key={seatIndex} className="p-4 relative group">
                        {isPartnerSlot && (
                          <div className="text-xs font-medium text-slate-500 text-center mb-2">
                            Mon partenaire
                          </div>
                        )}
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {player.displayName[0].toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{player.displayName}</p>
                          {player.isBot && (
                            <Badge variant="outline" className="mt-2">
                              <Bot className="w-3 h-3 mr-1" />
                              {player.difficulty === 'EASY' ? 'Faible' : player.difficulty === 'MEDIUM' ? 'Moyen' : 'Fort'}
                            </Badge>
                          )}
                          {player.isReady && (
                            <Badge className="mt-2 bg-green-600">Prêt</Badge>
                          )}
                        </div>
                        {player.isBot && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBot(player.userId)}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        )}
                      </Card>
                    );
                  }

                  return (
                    <Card key={seatIndex} className="p-4 border-2 border-dashed border-slate-300">
                      {isPartnerSlot && (
                        <div className="text-xs font-medium text-slate-500 text-center mb-2">
                          Mon partenaire
                        </div>
                      )}
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl text-slate-400">?</span>
                        </div>
                        <p className="text-sm text-slate-400">En attente...</p>

                        {canAddBots && players.length === 1 && isPartnerSlot && (
                          <Button
                            size="sm"
                            onClick={handleAddPartner}
                            className="w-full text-xs"
                            variant="outline"
                          >
                            <Bot className="w-3 h-3 mr-1" />
                            Ajouter partenaire
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {players.length === 1 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Compléter la table avec des bots
                  </h3>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-600 mb-1 block">
                        Niveau des bots
                      </label>
                      <Select
                        value={selectedDifficulty}
                        onValueChange={(value) => setSelectedDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">Faible</SelectItem>
                          <SelectItem value="MEDIUM">Moyen</SelectItem>
                          <SelectItem value="HARD">Fort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleCompleteTable}
                      className="flex-shrink-0"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Ajouter 3 bots
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                }}></div>

                <div className="relative z-10">
                  <GameStatusBar
                    phase={gameState.phase}
                    currentPlayerName={currentTurnPlayer?.displayName || 'En attente'}
                    contract={gameState.contract}
                    takerName={takerPlayer?.displayName || null}
                    className="mb-6"
                  />

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <PlayerSeat
                      player={getPlayerAtPosition('left')}
                      position="top"
                      isCurrentPlayer={gameState.currentPlayerSeat === getPlayerAtPosition('left')?.seatIndex}
                      playerColor="yellow"
                    />
                    <PlayerSeat
                      player={getPlayerAtPosition('top')}
                      position="top"
                      isCurrentPlayer={gameState.currentPlayerSeat === getPlayerAtPosition('top')?.seatIndex}
                      playerColor="red"
                    />
                    <PlayerSeat
                      player={getPlayerAtPosition('right')}
                      position="top"
                      isCurrentPlayer={gameState.currentPlayerSeat === getPlayerAtPosition('right')?.seatIndex}
                      playerColor="purple"
                    />
                  </div>

                  {gameState.phase === 'PLAYING' && (
                    <TrickArea cards={gameState.currentTrick} />
                  )}

                  {gameState.phase === 'BIDDING' && currentPlayer && (
                    <div className="bg-white rounded-lg p-6 mb-6">
                      <BiddingPanel
                        onBid={handleBid}
                        isMyTurn={isMyTurn || false}
                        availableBids={availableBids}
                      />
                    </div>
                  )}

                  <div className="bg-slate-800 rounded-xl p-6 overflow-hidden" style={{ height: '220px' }}>
                    {myHand && myHand.length > 0 ? (
                      <div className="flex justify-center items-start h-full">
                        <div className="relative" style={{ width: '100%', height: '400px', marginTop: '0' }}>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2">
                            <div className="relative" style={{ width: `${Math.min(myHand.length - 8, 7) * 45 + 128}px`, height: '200px' }}>
                              {myHand.slice(8).map((card, index) => (
                                <div
                                  key={card.id}
                                  className="absolute transition-all duration-200"
                                  style={{
                                    left: `${index * 45}px`,
                                    top: '0',
                                    zIndex: 10 + index,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.top = '-20px';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.top = '0';
                                  }}
                                >
                                  <TarotCard
                                    card={card}
                                    size="lg"
                                    selectable={isMyTurn && gameState.phase === 'PLAYING'}
                                    selected={selectedCard === card.id}
                                    onClick={() => handleCardClick(card.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '80px' }}>
                            <div className="relative" style={{ width: `${Math.min(myHand.length, 8) * 45 + 128}px`, height: '200px' }}>
                              {myHand.slice(0, 8).map((card, index) => (
                                <div
                                  key={card.id}
                                  className="absolute transition-all duration-200"
                                  style={{
                                    left: `${index * 45}px`,
                                    top: '0',
                                    zIndex: 30 + index,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.top = '-20px';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.top = '0';
                                  }}
                                >
                                  <TarotCard
                                    card={card}
                                    size="lg"
                                    selectable={isMyTurn && gameState.phase === 'PLAYING'}
                                    selected={selectedCard === card.id}
                                    onClick={() => handleCardClick(card.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white/50 text-sm">En attente des cartes...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
