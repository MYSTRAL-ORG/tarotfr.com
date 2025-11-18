'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TarotCard as TarotCardComponent } from '@/components/game/TarotCard';
import { PlayerSeat } from '@/components/game/PlayerSeat';
import { BiddingPanel } from '@/components/game/BiddingPanel';
import { GameStatusBar } from '@/components/game/GameStatusBar';
import { TarotCard, Player } from '@/lib/types';
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
  PlayCircle
} from 'lucide-react';

const createCard = (suit: any, rank: any, points: number): TarotCard => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  points,
});

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);

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

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
              <PlayCircle className="w-5 h-5" />
              <span className="font-semibold">Tutoriel interactif</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Comment jouer sur TarotFR
            </h1>
            <p className="text-xl text-slate-600">
              Suivez ce guide pas à pas pour maîtriser l'interface et jouer votre première partie
            </p>
          </div>

          {/* Progress Steps */}
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

          {/* Step Content */}
          <div className="space-y-8">
            {/* Step 0: Rejoindre une partie */}
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

            {/* Step 1: Interface de jeu */}
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
                  {/* Simulation de l'interface */}
                  <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-8 relative">
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                      1. Barre de statut
                    </div>

                    {/* Status Bar */}
                    <div className="mb-6">
                      <GameStatusBar
                        phase="PLAYING"
                        currentPlayerName="Vous"
                        contract="PETITE"
                        takerName="Vous"
                      />
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-3 gap-4 mb-6 relative">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        2. Autres joueurs
                      </div>
                      <PlayerSeat
                        player={mockPlayers[1]}
                        position="top"
                        isCurrentPlayer={false}
                        cardCount={15}
                      />
                      <PlayerSeat
                        player={mockPlayers[2]}
                        position="top"
                        isCurrentPlayer={false}
                        cardCount={15}
                      />
                      <PlayerSeat
                        player={mockPlayers[3]}
                        position="top"
                        isCurrentPlayer={false}
                        cardCount={15}
                      />
                    </div>

                    {/* Trick Area */}
                    <div className="bg-green-700 rounded-xl p-6 mb-6 min-h-32 flex items-center justify-center relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        3. Tapis (cartes jouées)
                      </div>
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

                    {/* Player Hand */}
                    <div className="relative">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        4. Votre main
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

                  {/* Explications */}
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
                          2
                        </div>
                        <h3 className="font-bold text-purple-900">Autres joueurs</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Les trois autres joueurs avec leur nom et le nombre de cartes qu'il leur reste.
                        Un indicateur lumineux montre le joueur actif.
                      </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <h3 className="font-bold text-red-900">Le tapis</h3>
                      </div>
                      <p className="text-slate-700 text-sm">
                        Zone centrale où apparaissent les cartes jouées par chaque joueur pendant le pli.
                        Le gagnant du pli remporte toutes ces cartes.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                          4
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

            {/* Step 2: Phase d'enchères */}
            {currentStep === 2 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[2].title}</h2>
                    <p className="text-slate-600">{steps[2].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-4">Comprendre les enchères</h3>
                    <p className="text-slate-700 mb-4">
                      Au début de chaque partie, les joueurs enchérissent à tour de rôle. Le but est
                      d'annoncer si vous pensez pouvoir gagner avec votre main.
                    </p>
                    <div className="bg-white p-6 rounded-lg">
                      <BiddingPanel
                        onBid={() => {}}
                        isMyTurn={true}
                        availableBids={['PASS', 'PETITE', 'GARDE']}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">1️⃣</span>
                        Attendez votre tour
                      </h4>
                      <p className="text-slate-700 text-sm">
                        La barre de statut indique quel joueur doit enchérir. Attendez que ce soit votre tour.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300">
                      <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">2️⃣</span>
                        Évaluez votre main
                      </h4>
                      <p className="text-slate-700 text-sm">
                        Comptez vos atouts, oudlers et figures. Une bonne main a au moins 8 atouts.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
                      <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">3️⃣</span>
                        Choisissez votre enchère
                      </h4>
                      <p className="text-slate-700 text-sm">
                        Cliquez sur un bouton : <strong>Passer</strong>, <strong>Petite</strong>, <strong>Garde</strong>, etc.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-2 border-orange-300">
                      <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">4️⃣</span>
                        Validez votre choix
                      </h4>
                      <p className="text-slate-700 text-sm">
                        Cliquez sur "Valider l'enchère". Attention, c'est irréversible !
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-4">💡 Conseil pour débuter</h3>
                    <div className="space-y-2 text-slate-700">
                      <p>• <strong>Avec moins de 6 atouts</strong> : Passez toujours</p>
                      <p>• <strong>Avec 6-8 atouts et 1 oudler</strong> : Prenez une Petite</p>
                      <p>• <strong>Avec 9+ atouts et 2 oudlers</strong> : Tentez une Garde</p>
                      <p>• <strong>Si vous n'êtes pas sûr</strong> : Passez ! C'est moins risqué</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Jouer vos cartes */}
            {currentStep === 3 && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <Hand className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{steps[3].title}</h2>
                    <p className="text-slate-600">{steps[3].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-900 mb-4">Comment jouer une carte</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-lg text-center">
                        <div className="text-4xl mb-3">👆</div>
                        <h4 className="font-bold text-slate-900 mb-2">1. Cliquez sur la carte</h4>
                        <p className="text-sm text-slate-600">
                          Dans votre main, cliquez sur la carte que vous voulez jouer. Elle se soulève légèrement.
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-lg text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <h4 className="font-bold text-slate-900 mb-2">2. Vérifiez votre choix</h4>
                        <p className="text-sm text-slate-600">
                          Assurez-vous que c'est la bonne carte. Vous pouvez cliquer sur une autre carte pour changer.
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-lg text-center">
                        <div className="text-4xl mb-3">🎯</div>
                        <h4 className="font-bold text-slate-900 mb-2">3. Validez</h4>
                        <p className="text-sm text-slate-600">
                          Cliquez sur le bouton "Jouer la carte" qui apparaît. La carte ira sur le tapis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Exemple visuel</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Votre main :</p>
                        <div className="flex gap-2 justify-center p-4 bg-slate-800 rounded-lg">
                          {exampleHand.map((card, index) => (
                            <TarotCardComponent
                              key={index}
                              card={card}
                              size="md"
                              selectable={true}
                              selected={index === 2}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button className="bg-orange-600" size="lg">
                          Jouer la carte sélectionnée
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Règles importantes</h3>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Vous devez fournir la couleur</h4>
                        <p className="text-sm text-slate-700">
                          Si un joueur joue un Cœur, vous devez jouer un Cœur si vous en avez.
                          Sinon, vous devez couper avec un atout.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Les cartes injouables sont grisées</h4>
                        <p className="text-sm text-slate-700">
                          Le jeu grise automatiquement les cartes que vous ne pouvez pas jouer selon les règles.
                          Vous ne pouvez sélectionner que les cartes jouables.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Suivre la partie */}
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
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-4">Le déroulement d'un pli</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-3xl mb-2">1️⃣</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Premier joueur</div>
                        <TarotCardComponent
                          card={createCard('HEARTS', '7', 0.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Joue un 7 de Cœur</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-3xl mb-2">2️⃣</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Deuxième joueur</div>
                        <TarotCardComponent
                          card={createCard('HEARTS', 'ROI', 4.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Fournit un Roi</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-3xl mb-2">3️⃣</div>
                        <div className="text-sm font-semibold text-green-800 mb-2">Troisième joueur</div>
                        <TarotCardComponent
                          card={createCard('TRUMPS', 'TRUMP_5', 0.5)}
                          size="sm"
                        />
                        <p className="text-xs text-slate-600 mt-2">Coupe avec un 5</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center border-4 border-yellow-400">
                        <div className="text-3xl mb-2">4️⃣</div>
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
                      <h4 className="font-bold text-blue-900 mb-3">👀 Observez le tapis</h4>
                      <p className="text-slate-700 text-sm mb-3">
                        Les cartes jouées apparaissent au centre. Regardez bien quelle est la couleur
                        demandée et quels atouts ont été joués.
                      </p>
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-slate-600 italic">
                          "Si un gros atout a été joué, inutile de surcouper avec votre 21 !"
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-3">📊 Comptez les cartes</h4>
                      <p className="text-slate-700 text-sm mb-3">
                        Essayez de mémoriser les cartes importantes jouées : le Petit, le 21, l'Excuse,
                        et les Rois.
                      </p>
                      <div className="bg-white p-3 rounded">
                        <p className="text-xs text-slate-600 italic">
                          "Si le 21 est déjà passé, vos gros atouts sont plus sûrs !"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Animation du pli</h3>
                    <p className="text-slate-700 mb-4">
                      Quand les 4 cartes sont jouées, une courte animation montre le gagnant du pli.
                      Les cartes sont ensuite collectées et le jeu continue.
                    </p>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <p className="text-sm text-green-700 font-semibold mb-2">
                        ✓ Joueur 2 remporte le pli !
                      </p>
                      <p className="text-xs text-slate-600">
                        Les cartes disparaissent et le Joueur 2 commence le prochain pli
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 5: Voir les scores */}
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
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-4">Fin de partie</h3>
                    <p className="text-slate-700 mb-4">
                      Après que les 18 plis ont été joués, le jeu passe automatiquement en phase de scoring.
                      Les points sont calculés et affichés.
                    </p>
                    <div className="bg-white rounded-lg p-6">
                      <h4 className="font-bold text-slate-900 mb-4 text-center">Résultats de la partie</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-300">
                          <div>
                            <span className="font-bold text-green-900">Vous (Preneur)</span>
                            <Badge className="ml-2 bg-green-600">Contrat réussi !</Badge>
                          </div>
                          <span className="text-2xl font-bold text-green-700">+75</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium text-slate-700">Joueur 2</span>
                          <span className="text-xl font-bold text-red-600">-25</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium text-slate-700">Joueur 3</span>
                          <span className="text-xl font-bold text-red-600">-25</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="font-medium text-slate-700">Joueur 4</span>
                          <span className="text-xl font-bold text-red-600">-25</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">🎉 Contrat réussi</h4>
                      <p className="text-slate-700 text-sm">
                        Si vous êtes le preneur et que vous avez fait votre contrat, vous gagnez des points.
                        Plus le contrat est difficile (Garde, Garde Sans...), plus vous gagnez de points !
                      </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                      <h4 className="font-bold text-red-900 mb-3">😔 Contrat échoué</h4>
                      <p className="text-slate-700 text-sm">
                        Si le preneur échoue, il perd des points et les défenseurs en gagnent.
                        C'est pourquoi il ne faut enchérir que si vous avez confiance en votre main !
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Continuer à jouer</h3>
                    <p className="text-slate-700 mb-4">
                      Après avoir vu les scores, vous pouvez soit :
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button className="bg-blue-600">Nouvelle partie</Button>
                      <Button variant="outline">Retour au lobby</Button>
                      <Button variant="outline">Quitter la table</Button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">🎊 Félicitations !</h3>
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

          {/* Navigation Buttons */}
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
