'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TarotCard as TarotCardComponent } from '@/components/game/TarotCard';
import { PlayerSeat } from '@/components/game/PlayerSeat';
import { TrickArea } from '@/components/game/TrickArea';
import { GameStatusBar } from '@/components/game/GameStatusBar';
import { BiddingPanel } from '@/components/game/BiddingPanel';
import { BotSelector } from '@/components/game/BotSelector';
import { TarotCard, Player, BidType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

const createCard = (suit: any, rank: any, points: number): TarotCard => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  points,
});

const mockPlayers: Player[] = [
  { id: '1', userId: '1', displayName: 'Vous', seatIndex: 0, isReady: true },
  { id: '2', userId: '2', displayName: 'Joueur 2', seatIndex: 1, isReady: true },
  { id: '3', userId: '3', displayName: 'Joueur 3', seatIndex: 2, isReady: true },
  { id: '4', userId: '4', displayName: 'Joueur 4', seatIndex: 3, isReady: true },
];

const mockHand: TarotCard[] = [
  createCard('TRUMPS', 'TRUMP_21', 4.5),
  createCard('TRUMPS', 'TRUMP_18', 0.5),
  createCard('TRUMPS', 'TRUMP_15', 0.5),
  createCard('TRUMPS', 'TRUMP_12', 0.5),
  createCard('TRUMPS', 'TRUMP_8', 0.5),
  createCard('HEARTS', 'ROI', 4.5),
  createCard('HEARTS', 'DAME', 3.5),
  createCard('HEARTS', 'CAVALIER', 2.5),
  createCard('HEARTS', '10', 0.5),
  createCard('CLUBS', 'VALET', 1.5),
  createCard('CLUBS', '9', 0.5),
  createCard('DIAMONDS', 'ROI', 4.5),
  createCard('DIAMONDS', '7', 0.5),
  createCard('SPADES', '8', 0.5),
  createCard('SPADES', '6', 0.5),
];

const mockTrickCards = [
  { card: createCard('HEARTS', '10', 0.5), playerSeat: 0 },
  { card: createCard('HEARTS', 'VALET', 1.5), playerSeat: 1 },
  { card: createCard('TRUMPS', 'TRUMP_5', 0.5), playerSeat: 2 },
];

export default function DemoPage() {
  const [phase, setPhase] = useState<'WAITING' | 'BIDDING' | 'PLAYING' | 'SCORING'>('WAITING');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [myBid, setMyBid] = useState<BidType | null>(null);
  const [showTrick, setShowTrick] = useState(false);

  const handleBid = (bid: BidType) => {
    setMyBid(bid);
  };

  const handleCardSelect = (cardId: string) => {
    setShowTrick(true);
    setSelectedCard(null);
  };

  const currentPlayerName = mockPlayers[0].displayName;
  const takerName = mockPlayers[2].displayName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Badge variant="outline" className="text-lg">
              Mode Démo - Interface de Jeu
            </Badge>
            <div className="flex gap-2">
              <Button
                variant={phase === 'WAITING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('WAITING')}
              >
                Attente
              </Button>
              <Button
                variant={phase === 'BIDDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('BIDDING')}
              >
                Enchères
              </Button>
              <Button
                variant={phase === 'PLAYING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('PLAYING')}
              >
                Jeu
              </Button>
              <Button
                variant={phase === 'SCORING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhase('SCORING')}
              >
                Scores
              </Button>
            </div>
          </div>

          {phase === 'WAITING' && (
            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Salle d'attente
                </h2>
                <p className="text-slate-600 mb-6">
                  En attente des joueurs...
                </p>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {mockPlayers.map((player) => (
                    <Card key={player.id} className="p-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {player.displayName[0]}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900">{player.displayName}</p>
                        {player.isReady && (
                          <Badge className="mt-2 bg-green-600">Prêt</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <BotSelector
                    players={mockPlayers}
                    onAddBot={(difficulty) => console.log('Add bot', difficulty)}
                    onRemoveBot={(botId) => console.log('Remove bot', botId)}
                    disabled={false}
                  />
                  <Button className="w-full" size="lg">
                    Je suis prêt !
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {(phase === 'BIDDING' || phase === 'PLAYING') && (
            <div className="space-y-6">
              <GameStatusBar
                phase={phase}
                currentPlayerName={currentPlayerName}
                contract={phase === 'PLAYING' ? 'GARDE' : null}
                takerName={phase === 'PLAYING' ? takerName : null}
              />

              <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                }}></div>
                <div className="relative z-10">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <PlayerSeat
                    player={mockPlayers[1]}
                    position="top"
                    isCurrentPlayer={false}
                  />
                  <PlayerSeat
                    player={mockPlayers[2]}
                    position="top"
                    isCurrentPlayer={phase === 'PLAYING'}
                  />
                  <PlayerSeat
                    player={mockPlayers[3]}
                    position="top"
                    isCurrentPlayer={false}
                  />
                </div>

                {phase === 'PLAYING' && (
                  <TrickArea
                    cards={showTrick ? mockTrickCards : []}
                  />
                )}

                {phase === 'BIDDING' && !myBid && (
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <BiddingPanel
                      onBid={handleBid}
                      isMyTurn={true}
                      availableBids={['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE']}
                    />
                  </div>
                )}

                {phase === 'BIDDING' && myBid && (
                  <div className="bg-white rounded-lg p-6 mb-6 text-center">
                    <p className="text-slate-900 font-semibold">
                      Vous avez enchéri : <Badge>{myBid}</Badge>
                    </p>
                    <p className="text-slate-600 text-sm mt-2">
                      En attente des autres joueurs...
                    </p>
                  </div>
                )}

                <div className="bg-slate-800 rounded-xl p-6 overflow-hidden" style={{ height: '220px' }}>
                  <div className="flex justify-center items-end h-full">
                    <div className="relative" style={{ width: 'fit-content', height: '320px' }}>
                      {/* Première ligne - 8 cartes (en bas, z-index bas) */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
                        <div className="relative" style={{ width: `${8 * 45 + 128}px`, height: '200px' }}>
                          {mockHand.slice(0, 8).map((card, index) => (
                            <div
                              key={card.id}
                              className="absolute transition-all duration-200"
                              style={{
                                left: `${index * 45}px`,
                                bottom: '0',
                                zIndex: 10 + index,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.zIndex = '100';
                                e.currentTarget.style.bottom = '20px';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.zIndex = `${10 + index}`;
                                e.currentTarget.style.bottom = '0';
                              }}
                            >
                              <TarotCardComponent
                                card={card}
                                size="lg"
                                selectable={phase === 'PLAYING'}
                                selected={false}
                                onClick={() => handleCardSelect(card.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deuxième ligne - 7 cartes (au-dessus, z-index haut) */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ zIndex: 20 }}>
                        <div className="relative" style={{ width: `${7 * 45 + 128}px`, height: '200px' }}>
                          {mockHand.slice(8).map((card, index) => (
                            <div
                              key={card.id}
                              className="absolute transition-all duration-200"
                              style={{
                                left: `${index * 45}px`,
                                bottom: '0',
                                zIndex: 30 + index,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.zIndex = '100';
                                e.currentTarget.style.bottom = '20px';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.zIndex = `${30 + index}`;
                                e.currentTarget.style.bottom = '0';
                              }}
                            >
                              <TarotCardComponent
                                card={card}
                                size="lg"
                                selectable={phase === 'PLAYING'}
                                selected={false}
                                onClick={() => handleCardSelect(card.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'SCORING' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Résultats de la partie
              </h2>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">Joueur 3</span>
                      <Badge className="ml-2 bg-blue-600">Preneur</Badge>
                      <Badge className="ml-2 bg-green-600">Contrat réussi</Badge>
                    </div>
                    <span className="text-3xl font-bold text-green-700">+75</span>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Vous</span>
                    <span className="text-3xl font-bold text-red-600">-25</span>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Joueur 2</span>
                    <span className="text-3xl font-bold text-red-600">-25</span>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Joueur 4</span>
                    <span className="text-3xl font-bold text-red-600">-25</span>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Button size="lg">
                    Rejouer
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
