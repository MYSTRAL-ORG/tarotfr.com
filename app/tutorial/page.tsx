'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TarotCard as TarotCardComponent } from '@/components/game/TarotCard';
import { PlayerSeat } from '@/components/game/PlayerSeat';
import { BiddingPanel } from '@/components/game/BiddingPanel';
import { GameStatusBar } from '@/components/game/GameStatusBar';
import { TrickArea } from '@/components/game/TrickArea';
import { TarotCard, Player, BidType, PlayedCard } from '@/lib/types';
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Hand,
  Target,
  Layers,
  Trophy,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  RotateCcw
} from 'lucide-react';
import {
  SimulationState,
  initialSimulationState,
  processBid,
  playCard,
  completeTrick,
  nextTrick,
  getBidDisplayName,
  botNames,
} from '@/lib/tutorialSimulation';

const createCard = (suit: any, rank: any, points: number): TarotCard => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  points,
});

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [simulation, setSimulation] = useState<SimulationState>(initialSimulationState);
  const [autoPlayTimeout, setAutoPlayTimeout] = useState<NodeJS.Timeout | null>(null);

  const mockPlayers: Player[] = [
    { id: '1', userId: '1', displayName: 'Vous', seatIndex: 0, isReady: true },
    { id: '2', userId: '2', displayName: 'Joueur 2', seatIndex: 1, isReady: true },
    { id: '3', userId: '3', displayName: 'Joueur 3', seatIndex: 2, isReady: true },
    { id: '4', userId: '4', displayName: 'Joueur 4', seatIndex: 3, isReady: true },
  ];

  const exampleHand = [
    createCard('TRUMPS', 'TRUMP_15', 0.5),
    createCard('HEARTS', 'ROI', 4.5),
    createCard('TRUMPS', 'TRUMP_8', 0.5),
    createCard('CLUBS', 'DAME', 3.5),
    createCard('TRUMPS', 'TRUMP_21', 4.5),
    createCard('DIAMONDS', '7', 0.5),
  ];

  useEffect(() => {
    return () => {
      if (autoPlayTimeout) {
        clearTimeout(autoPlayTimeout);
      }
    };
  }, [autoPlayTimeout]);

  const resetSimulation = () => {
    if (autoPlayTimeout) {
      clearTimeout(autoPlayTimeout);
    }
    setSimulation(initialSimulationState);
  };

  const handleBid = (bid: BidType) => {
    const newState = processBid(simulation, bid);
    setSimulation(newState);
  };

  const handleCardSelect = (index: number) => {
    if (!simulation.canPlay) return;
    setSimulation({ ...simulation, selectedCard: index });
  };

  const handlePlayCard = () => {
    if (simulation.selectedCard === null) return;

    const afterPlay = playCard(simulation, simulation.selectedCard);
    setSimulation(afterPlay);

    const timeout = setTimeout(() => {
      const afterBots = completeTrick(afterPlay);
      setSimulation(afterBots);

      const timeout2 = setTimeout(() => {
        const afterTrick = nextTrick(afterBots);
        setSimulation(afterTrick);
      }, 2000);

      setAutoPlayTimeout(timeout2);
    }, 1000);

    setAutoPlayTimeout(timeout);
  };

  const steps = [
    {
      title: 'Rejoindre une partie',
      description: 'Découvrez comment créer ou rejoindre une table de jeu',
      icon: Users,
    },
    {
      title: "L'interface de jeu",
      description: 'Apprenez à identifier tous les éléments à l\'écran',
      icon: Target,
    },
    {
      title: 'Phase d\'enchères',
      description: 'Comment faire une enchère et devenir le preneur',
      icon: MessageSquare,
    },
    {
      title: 'Jouer vos cartes',
      description: 'Sélectionnez et jouez vos cartes au bon moment',
      icon: Hand,
    },
    {
      title: 'Suivre la partie',
      description: 'Comprendre le déroulement et les plis',
      icon: Layers,
    },
    {
      title: 'Voir les scores',
      description: 'Consultez les résultats à la fin de la partie',
      icon: Trophy,
    },
  ];

  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    if (currentStep === 1) {
      resetSimulation();
    }
  };

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const getCurrentPlayerName = () => {
    if (simulation.currentPlayer === 0) return 'Vous';
    return botNames[simulation.currentPlayer - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Comment jouer sur TarotFR
            </h1>
            <p className="text-xl text-slate-600">
              Suivez ce guide pas à pas pour maîtriser l'interface et jouer votre première partie
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => setCurrentStep(index)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white scale-110 shadow-lg'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </button>
                      <span className={`text-xs mt-2 text-center font-medium ${
                        isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-slate-400'
                      }`}>
                        {step.title.split(' ')[0]}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded ${
                        isCompleted ? 'bg-green-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            {currentStep === 0 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[0].title}</h2>
                    <p className="text-slate-600">{steps[0].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Étape 1 : Accéder à la page "Jouer"</h3>
                    <p className="text-slate-700 mb-4">
                      Cliquez sur le bouton <strong>"Jouer"</strong> dans le menu de navigation en haut de la page.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex gap-3">
                        <Button variant="outline">Règles</Button>
                        <Button className="bg-blue-600">Jouer</Button>
                        <Button variant="outline">Mon compte</Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-4">Étape 2 : Créer ou rejoindre une table</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-lg border-2 border-green-300">
                        <h4 className="font-bold text-green-900 mb-2">Créer une nouvelle table</h4>
                        <p className="text-slate-700 text-sm mb-4">
                          Créez votre propre table et attendez que d'autres joueurs vous rejoignent.
                        </p>
                        <Button className="w-full bg-green-600">Créer une table</Button>
                      </div>
                      <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
                        <h4 className="font-bold text-blue-900 mb-2">Rejoindre une table existante</h4>
                        <p className="text-slate-700 text-sm mb-4">
                          Parcourez la liste des tables disponibles et rejoignez-en une.
                        </p>
                        <div className="space-y-2">
                          <div className="p-3 bg-slate-50 rounded border flex items-center justify-between">
                            <span className="text-sm">Table #1 (2/4 joueurs)</span>
                            <Button size="sm" variant="outline">Rejoindre</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Étape 3 : Ajouter des bots (optionnel)</h3>
                    <p className="text-slate-700 mb-4">
                      Si vous voulez jouer seul ou compléter la table, vous pouvez ajouter des joueurs bots
                      avec différents niveaux de difficulté.
                    </p>
                    <div className="bg-white p-4 rounded-lg max-w-md">
                      <div className="mb-3">
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                          Niveau de difficulté
                        </label>
                        <select className="w-full p-2 border rounded">
                          <option>Faible</option>
                          <option>Moyen</option>
                          <option>Fort</option>
                        </select>
                      </div>
                      <Button className="w-full">Ajouter un bot</Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-4">Étape 4 : Se marquer prêt</h3>
                    <p className="text-slate-700 mb-4">
                      Une fois que 4 joueurs sont présents, cliquez sur <strong>"Prêt"</strong> pour signaler
                      que vous êtes prêt à jouer. La partie commence dès que tous les joueurs sont prêts !
                    </p>
                    <Button className="bg-yellow-600">Je suis prêt !</Button>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 1 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[1].title}</h2>
                    <p className="text-slate-600">{steps[1].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-8 relative">
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                      1. Barre de statut
                    </div>

                    <div className="mb-6">
                      <GameStatusBar
                        phase="PLAYING"
                        currentPlayerName="Vous"
                        contract="PETITE"
                        takerName="Vous"
                      />
                    </div>

                    <div className="flex justify-center mb-6 relative">
                      <div className="absolute -top-8 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        2. Joueur en face
                      </div>
                      <PlayerSeat
                        player={mockPlayers[2]}
                        position="top"
                        isCurrentPlayer={false}
                        cardCount={15}
                      />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 whitespace-nowrap">
                          3. Gauche
                        </div>
                        <PlayerSeat
                          player={mockPlayers[1]}
                          position="left"
                          isCurrentPlayer={false}
                          cardCount={15}
                        />
                      </div>

                      <div className="flex-1 mx-6 relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                          4. Tapis
                        </div>
                        <div className="bg-green-700 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                          <div className="flex gap-4">
                            <TarotCardComponent
                              card={createCard('HEARTS', '10', 0.5)}
                              size="md"
                            />
                            <TarotCardComponent
                              card={createCard('TRUMPS', 'TRUMP_12', 0.5)}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 whitespace-nowrap">
                          5. Droite
                        </div>
                        <PlayerSeat
                          player={mockPlayers[3]}
                          position="right"
                          isCurrentPlayer={false}
                          cardCount={15}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        6. Votre main
                      </div>
                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {exampleHand.map((card, index) => (
                            <TarotCardComponent
                              key={index}
                              card={card}
                              size="md"
                              selectable={true}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <h3 className="font-bold text-blue-900">Barre de statut</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Affiche la phase actuelle (enchères, jeu, scores), le joueur dont c'est le tour,
                        et le contrat en cours avec le preneur.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          2-5
                        </div>
                        <h3 className="font-bold text-purple-900">Autres joueurs</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Les trois autres joueurs positionnés en haut, à gauche et à droite avec leur nom et le nombre de cartes.
                        Un indicateur lumineux montre le joueur actif.
                      </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          4
                        </div>
                        <h3 className="font-bold text-red-900">Le tapis</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Zone centrale où apparaissent les cartes jouées. Les 4 cartes forment un carré centré.
                        Le gagnant du pli remporte toutes ces cartes.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                          6
                        </div>
                        <h3 className="font-bold text-orange-900">Votre main</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Vos cartes sont affichées en bas. Cliquez sur une carte pour la sélectionner,
                        puis sur "Jouer la carte" quand c'est votre tour.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">{steps[2].title}</h2>
                    <p className="text-slate-600">{steps[2].description}</p>
                  </div>
                  <Button onClick={resetSimulation} variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Recommencer
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-8">
                    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                      <p className="text-yellow-900 font-semibold text-center">
                        {simulation.message}
                      </p>
                    </div>

                    {simulation.phase === 'bidding' && simulation.playerBid === null && (
                      <div className="bg-white rounded-lg p-6">
                        <BiddingPanel
                          onBid={handleBid}
                          isMyTurn={true}
                          availableBids={['PASS', 'PETITE', 'GARDE']}
                        />
                      </div>
                    )}

                    {simulation.playerBid !== null && (
                      <div className="bg-white rounded-lg p-6">
                        <h3 className="font-bold text-slate-900 mb-4 text-center">Résultat des enchères</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="font-medium">Vous</span>
                            <Badge>{getBidDisplayName(simulation.playerBid)}</Badge>
                          </div>
                          {simulation.botBids.map((bid, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                              <span className="font-medium">{botNames[index]}</span>
                              <Badge variant="outline">{getBidDisplayName(bid)}</Badge>
                            </div>
                          ))}
                        </div>
                        {simulation.phase === 'playing' && (
                          <div className="mt-4 text-center">
                            <Button onClick={() => nextStep()} className="bg-green-600">
                              Continuer vers le jeu
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Instructions</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl mb-2 font-bold text-blue-600">1</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Évaluez votre main</h4>
                        <p className="text-sm text-slate-600">
                          Avec 8+ atouts dont le 21, 18 et 15, vous avez une bonne main !
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl mb-2 font-bold text-blue-600">2</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Choisissez</h4>
                        <p className="text-sm text-slate-600">
                          Cliquez sur Petite ou Garde pour prendre, ou Passer si vous préférez.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-2xl mb-2 font-bold text-blue-600">3</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Observez</h4>
                        <p className="text-sm text-slate-600">
                          Les autres joueurs enchérissent automatiquement après vous.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <Hand className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">{steps[3].title}</h2>
                    <p className="text-slate-600">{steps[3].description}</p>
                  </div>
                  <Button onClick={resetSimulation} variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Recommencer
                  </Button>
                </div>

                <div className="space-y-6">
                  {simulation.phase === 'bidding' && (
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 text-center">
                      <p className="text-yellow-900 font-semibold mb-4">
                        Vous devez d'abord faire une enchère !
                      </p>
                      <Button onClick={() => setCurrentStep(2)} variant="outline">
                        Retour aux enchères
                      </Button>
                    </div>
                  )}

                  {simulation.phase === 'playing' && (
                    <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-8">
                      <div className="mb-4">
                        <GameStatusBar
                          phase="PLAYING"
                          currentPlayerName={getCurrentPlayerName()}
                          contract={simulation.contract as BidType}
                          takerName={simulation.contractWinner === 0 ? 'Vous' : botNames[simulation.contractWinner - 1]}
                        />
                      </div>

                      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                        <p className="text-yellow-900 font-semibold text-center">
                          {simulation.message}
                        </p>
                      </div>

                      <div className="flex justify-center mb-6">
                        <PlayerSeat
                          player={mockPlayers[2]}
                          position="top"
                          isCurrentPlayer={simulation.currentPlayer === 2}
                          cardCount={15 - simulation.currentTrick * 4}
                        />
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <PlayerSeat
                          player={mockPlayers[1]}
                          position="left"
                          isCurrentPlayer={simulation.currentPlayer === 1}
                          cardCount={15 - simulation.currentTrick * 4}
                        />

                        <div className="flex-1 mx-6">
                          {simulation.trickCards.length > 0 ? (
                            <TrickArea
                              cards={simulation.trickCards.map(tc => ({
                                playerSeat: tc.player,
                                card: tc.card
                              }))}
                            />
                          ) : (
                            <div className="bg-green-700 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                              <p className="text-white text-lg">Aucune carte jouée</p>
                            </div>
                          )}
                        </div>

                        <PlayerSeat
                          player={mockPlayers[3]}
                          position="right"
                          isCurrentPlayer={simulation.currentPlayer === 3}
                          cardCount={15 - simulation.currentTrick * 4}
                        />
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4">
                        <div className="flex gap-2 justify-center flex-wrap mb-4">
                          {simulation.playerHand.map((card, index) => (
                            <TarotCardComponent
                              key={card.id}
                              card={card}
                              size="md"
                              selectable={simulation.canPlay}
                              selected={simulation.selectedCard === index}
                              onClick={() => handleCardSelect(index)}
                            />
                          ))}
                        </div>
                        {simulation.canPlay && simulation.selectedCard !== null && (
                          <div className="text-center">
                            <Button onClick={handlePlayCard} size="lg" className="bg-orange-600">
                              Jouer la carte sélectionnée
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Comment jouer</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-orange-600">1</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Cliquez sur une carte</h4>
                        <p className="text-sm text-slate-600">
                          La carte se soulève pour indiquer votre sélection.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-orange-600">2</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Validez</h4>
                        <p className="text-sm text-slate-600">
                          Cliquez sur "Jouer la carte" pour confirmer.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-orange-600">3</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Attendez</h4>
                        <p className="text-sm text-slate-600">
                          Les autres joueurs jouent automatiquement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[4].title}</h2>
                    <p className="text-slate-600">{steps[4].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {simulation.phase !== 'playing' ? (
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 text-center">
                      <p className="text-yellow-900 font-semibold mb-4">
                        Jouez quelques plis à l'étape précédente pour voir le déroulement !
                      </p>
                      <Button onClick={() => setCurrentStep(3)} variant="outline">
                        Retour au jeu
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-green-900 mb-4">État actuel de la partie</h3>
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Pli actuel</span>
                          <Badge>{simulation.currentTrick + 1} / 3</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Cartes jouées dans ce pli</span>
                          <Badge>{simulation.trickCards.length} / 4</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Cartes restantes</span>
                          <Badge>{simulation.playerHand.length}</Badge>
                        </div>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Continuez à jouer pour voir comment les plis se résolvent. Le joueur avec la carte
                        la plus forte remporte le pli et commence le suivant !
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-4">Le déroulement d'un pli</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-green-600">1</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Premier joueur</div>
                        <TarotCardComponent
                          card={createCard('HEARTS', '7', 0.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Joue un 7 de Cœur</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-green-600">2</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Deuxième joueur</div>
                        <TarotCardComponent
                          card={createCard('HEARTS', 'ROI', 4.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Fournit un Roi</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl mb-2 font-bold text-green-600">3</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Troisième joueur</div>
                        <TarotCardComponent
                          card={createCard('TRUMPS', 'TRUMP_5', 0.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Coupe avec un 5</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center border-4 border-yellow-400">
                        <div className="text-2xl mb-2 font-bold text-green-600">4</div>
                        <div className="text-sm font-semibold text-yellow-800 mb-2">Quatrième joueur</div>
                        <TarotCardComponent
                          card={createCard('TRUMPS', 'TRUMP_15', 0.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Surcoupe et gagne !</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-yellow-100 p-4 rounded-lg text-center">
                      <p className="font-semibold text-yellow-900">
                        Le joueur 4 remporte le pli avec l'atout 15 et entame le prochain pli !
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3">Observez le tapis</h4>
                      <p className="text-slate-700 text-sm mb-3">
                        Les cartes jouées apparaissent au centre. Regardez bien quelle est la couleur
                        demandée et quels atouts ont été joués.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-3">Comptez les cartes</h4>
                      <p className="text-slate-700 text-sm mb-3">
                        Essayez de mémoriser les cartes importantes jouées : le Petit, le 21, l'Excuse,
                        et les Rois.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 5 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-600 rounded-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[5].title}</h2>
                    <p className="text-slate-600">{steps[5].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {simulation.phase === 'scoring' ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-yellow-900 mb-4">Résultats de la partie</h3>
                      <div className="bg-white rounded-lg p-6">
                        <div className="space-y-3">
                          {simulation.scores.map((score) => (
                            <div
                              key={score.player}
                              className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                                score.score > 0
                                  ? 'bg-green-50 border-green-300'
                                  : 'bg-red-50 border-red-300'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-slate-900">{score.displayName}</span>
                                {score.player === simulation.contractWinner && (
                                  <Badge className="ml-2 bg-blue-600">Preneur</Badge>
                                )}
                              </div>
                              <span
                                className={`text-2xl font-bold ${
                                  score.score > 0 ? 'text-green-700' : 'text-red-600'
                                }`}
                              >
                                {score.score > 0 ? '+' : ''}
                                {score.score}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 text-center">
                          <Button onClick={resetSimulation} className="bg-blue-600">
                            Rejouer le tutoriel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 text-center">
                      <p className="text-yellow-900 font-semibold mb-4">
                        Terminez les plis pour voir les scores !
                      </p>
                      <Button onClick={() => setCurrentStep(3)} variant="outline">
                        Retour au jeu
                      </Button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">Contrat réussi</h4>
                      <p className="text-slate-700 text-sm">
                        Si vous êtes le preneur et que vous avez fait votre contrat, vous gagnez des points.
                        Plus le contrat est difficile (Garde, Garde Sans...), plus vous gagnez de points !
                      </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                      <h4 className="font-bold text-red-900 mb-3">Contrat échoué</h4>
                      <p className="text-slate-700 text-sm">
                        Si le preneur échoue, il perd des points et les défenseurs en gagnent.
                        C'est pourquoi il ne faut enchérir que si vous avez confiance en votre main !
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Félicitations !</h3>
                    <p className="text-slate-300 mb-6">
                      Vous savez maintenant comment jouer sur TarotFR. Il ne vous reste plus qu'à pratiquer !
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-slate-900 hover:bg-slate-100"
                      onClick={() => window.location.href = '/play'}
                    >
                      Lancer ma première partie
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Étape précédente
            </Button>

            <div className="text-sm text-slate-600 font-medium">
              Étape {currentStep + 1} sur {steps.length}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-2"
            >
              Étape suivante
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
