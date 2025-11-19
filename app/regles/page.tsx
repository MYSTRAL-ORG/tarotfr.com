'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { TarotCard } from '@/components/game/TarotCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TarotCard as TarotCardType, TarotSuit, TarotRank } from '@/lib/types';
import { Users, Layers, Trophy, Target, Sparkles } from 'lucide-react';

const createCard = (suit: TarotSuit, rank: TarotRank, points: number): TarotCardType => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  points,
});

export default function RulesPage() {
  const [selectedBid, setSelectedBid] = useState<string>('PETITE');

  const oudlers = [
    createCard('EXCUSE', 'EXCUSE', 4.5),
    createCard('TRUMPS', 'TRUMP_1', 4.5),
    createCard('TRUMPS', 'TRUMP_21', 4.5),
  ];

  const figures = [
    createCard('HEARTS', 'ROI', 4.5),
    createCard('CLUBS', 'DAME', 3.5),
    createCard('DIAMONDS', 'CAVALIER', 2.5),
    createCard('SPADES', 'VALET', 1.5),
  ];

  const trumpExamples = [
    createCard('TRUMPS', 'TRUMP_1', 4.5),
    createCard('TRUMPS', 'TRUMP_5', 0.5),
    createCard('TRUMPS', 'TRUMP_10', 0.5),
    createCard('TRUMPS', 'TRUMP_15', 0.5),
    createCard('TRUMPS', 'TRUMP_21', 4.5),
  ];

  const colorExamples = [
    createCard('HEARTS', 'ROI', 4.5),
    createCard('CLUBS', 'DAME', 3.5),
    createCard('DIAMONDS', '7', 0.5),
    createCard('SPADES', '10', 0.5),
  ];

  const bids = [
    { id: 'PETITE', name: 'Petite', mult: 'x1', desc: 'Contrat de base' },
    { id: 'GARDE', name: 'Garde', mult: 'x2', desc: 'Contrat intermédiaire' },
    { id: 'GARDE_SANS', name: 'Garde Sans', mult: 'x4', desc: 'Sans voir le chien' },
    { id: 'GARDE_CONTRE', name: 'Garde Contre', mult: 'x6', desc: 'Chien aux défenseurs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Règles du Tarot à 4
            </h1>
            <p className="text-xl text-slate-600">
              Apprenez à jouer avec des exemples visuels interactifs
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-slate-900">Objectif du jeu</h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Le Tarot se joue à <strong>4 joueurs</strong>. Un joueur, le <strong className="text-blue-700">preneur</strong>,
                    s'oppose aux trois <strong className="text-red-700">défenseurs</strong>. Le preneur doit réaliser
                    un nombre de points suffisant avec les plis qu'il remporte.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Composition du jeu</h2>
                  <p className="text-lg text-slate-600 mt-2">78 cartes réparties en plusieurs catégories</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    Les 3 Oudlers (Bouts)
                  </h3>
                  <p className="text-slate-600">
                    Les cartes les plus importantes du jeu, valant <strong>4,5 points</strong> chacune
                  </p>
                  <div className="flex gap-3 justify-center p-4 bg-slate-50 rounded-lg">
                    {oudlers.map((card) => (
                      <TarotCard
                        key={card.id}
                        card={card}
                        size="sm"
                        selectable={false}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• <strong>L'Excuse</strong> : Ne remporte jamais un pli</p>
                    <p>• <strong>Le Petit (1)</strong> : L'atout le plus faible</p>
                    <p>• <strong>Le 21</strong> : L'atout le plus fort</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800">Les Figures</h3>
                  <p className="text-slate-600">
                    Chaque couleur contient 4 figures de valeur
                  </p>
                  <div className="flex gap-3 justify-center p-4 bg-slate-50 rounded-lg">
                    {figures.map((card) => (
                      <TarotCard
                        key={card.id}
                        card={card}
                        size="sm"
                        selectable={false}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• <strong>Roi</strong> : 4,5 points</p>
                    <p>• <strong>Dame</strong> : 3,5 points</p>
                    <p>• <strong>Cavalier</strong> : 2,5 points</p>
                    <p>• <strong>Valet</strong> : 1,5 point</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">21 Atouts</h3>
                    <div className="flex gap-2 justify-center p-4 bg-slate-50 rounded-lg">
                      {trumpExamples.map((card) => (
                        <TarotCard
                          key={card.id}
                          card={card}
                          size="sm"
                          selectable={false}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Les atouts sont plus forts que toutes les couleurs
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">4 Couleurs (56 cartes)</h3>
                    <div className="flex gap-2 justify-center p-4 bg-slate-50 rounded-lg">
                      {colorExamples.map((card) => (
                        <TarotCard
                          key={card.id}
                          card={card}
                          size="sm"
                          selectable={false}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Cœur, Carreau, Trèfle, Pique (14 cartes chacune)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-900">Distribution et Déroulement</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-center">
                    Étape 1 : Distribution
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-slate-700">
                    <p>• <strong>18 cartes</strong> par joueur</p>
                    <p>• <strong>6 cartes</strong> au chien (face cachée)</p>
                    <p>• Distribution 3 par 3</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold text-center">
                    Étape 2 : Enchères
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-slate-700">
                    <p>• Chaque joueur annonce à tour de rôle</p>
                    <p>• Le plus haut contrat l'emporte</p>
                    <p>• Le preneur s'oppose aux 3 autres</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-center">
                    Étape 3 : Jeu
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-slate-700">
                    <p>• 18 plis à jouer</p>
                    <p>• Suivre les règles de pose</p>
                    <p>• Le preneur doit faire son contrat</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-3xl font-bold mb-6 text-slate-900 text-center">Les Enchères</h2>
              <p className="text-center text-slate-700 mb-6">
                Sélectionnez un contrat pour voir ses détails
              </p>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {bids.map((bid) => (
                  <Button
                    key={bid.id}
                    onClick={() => setSelectedBid(bid.id)}
                    variant={selectedBid === bid.id ? 'default' : 'outline'}
                    className="h-auto flex-col py-4 gap-2"
                  >
                    <div className="font-bold text-lg">{bid.name}</div>
                    <Badge variant="secondary">{bid.mult}</Badge>
                  </Button>
                ))}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                {selectedBid === 'PETITE' && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-blue-700">Petite (contrat de base)</h3>
                    <p className="text-slate-700">
                      Le preneur prend le chien, l'intègre à son jeu, puis écarte 6 cartes.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold text-blue-900">Multiplicateur : x1</p>
                      <p className="text-sm text-blue-700 mt-1">Score de base non multiplié</p>
                    </div>
                  </div>
                )}
                {selectedBid === 'GARDE' && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-purple-700">Garde</h3>
                    <p className="text-slate-700">
                      Même principe que la Petite, mais avec un multiplicateur de points plus élevé.
                      Le preneur est plus confiant en sa main.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="font-semibold text-purple-900">Multiplicateur : x2</p>
                      <p className="text-sm text-purple-700 mt-1">Le score est doublé</p>
                    </div>
                  </div>
                )}
                {selectedBid === 'GARDE_SANS' && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-orange-700">Garde Sans le Chien</h3>
                    <p className="text-slate-700">
                      Le preneur ne voit pas le chien et joue avec ses 18 cartes uniquement.
                      Le chien compte pour le preneur en fin de partie.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="font-semibold text-orange-900">Multiplicateur : x4</p>
                      <p className="text-sm text-orange-700 mt-1">Contrat très risqué, score quadruplé</p>
                    </div>
                  </div>
                )}
                {selectedBid === 'GARDE_CONTRE' && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-red-700">Garde Contre le Chien</h3>
                    <p className="text-slate-700">
                      Le preneur ne voit pas le chien qui est attribué aux défenseurs.
                      Contrat le plus risqué et le plus rémunérateur.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="font-semibold text-red-900">Multiplicateur : x6</p>
                      <p className="text-sm text-red-700 mt-1">Contrat extrême, score multiplié par 6</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-900">Règles de pose des cartes</h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">1. Fournir la couleur</h3>
                  <p className="text-slate-700">
                    Si un joueur joue un <strong>Cœur</strong>, vous devez jouer un Cœur si vous en avez.
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Carte jouée</p>
                        <TarotCard card={createCard('HEARTS', '7', 0.5)} size="sm" selectable={false} />
                      </div>
                      <div className="text-3xl text-slate-400">→</div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Vous devez jouer</p>
                        <TarotCard card={createCard('HEARTS', '10', 0.5)} size="sm" selectable={false} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border-l-4 border-red-600">
                  <h3 className="text-xl font-bold text-red-900 mb-3">2. Couper si vous n'avez pas la couleur</h3>
                  <p className="text-slate-700">
                    Si vous ne pouvez pas fournir, vous devez <strong>couper avec un atout</strong>.
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Carte jouée</p>
                        <TarotCard card={createCard('CLUBS', 'ROI', 4.5)} size="sm" selectable={false} />
                      </div>
                      <div className="text-3xl text-slate-400">→</div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Pas de Trèfle ? Coupez !</p>
                        <TarotCard card={createCard('TRUMPS', 'TRUMP_8', 0.5)} size="sm" selectable={false} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-600">
                  <h3 className="text-xl font-bold text-purple-900 mb-3">3. Surcouper si possible</h3>
                  <p className="text-slate-700">
                    Si un atout est déjà joué, vous devez jouer un <strong>atout plus fort</strong> si vous le pouvez.
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Atout joué</p>
                        <TarotCard card={createCard('TRUMPS', 'TRUMP_10', 0.5)} size="sm" selectable={false} />
                      </div>
                      <div className="text-3xl text-slate-400">→</div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-2">Surcoupez !</p>
                        <TarotCard card={createCard('TRUMPS', 'TRUMP_15', 0.5)} size="sm" selectable={false} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border-l-4 border-yellow-600">
                  <h3 className="text-xl font-bold text-yellow-900 mb-3">4. L'Excuse - Carte spéciale</h3>
                  <p className="text-slate-700 mb-3">
                    <strong>L'Excuse</strong> peut être jouée à tout moment mais ne remporte jamais le pli.
                    Elle reste chez son propriétaire.
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg flex justify-center">
                    <TarotCard card={createCard('EXCUSE', 'EXCUSE', 4.5)} size="md" selectable={false} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Comptage des points</h2>
                  <p className="text-lg text-slate-600 mt-2">Comment gagner votre contrat</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <p className="text-slate-700 text-lg">
                  Le preneur doit atteindre un <strong>nombre de points minimum</strong> qui dépend
                  du nombre d'oudlers dans ses plis :
                </p>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg text-center border-2 border-yellow-400">
                    <div className="text-3xl font-bold text-yellow-900 mb-1">36</div>
                    <div className="text-sm font-semibold text-yellow-800">avec 3 oudlers</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-lg text-center border-2 border-orange-400">
                    <div className="text-3xl font-bold text-orange-900 mb-1">41</div>
                    <div className="text-sm font-semibold text-orange-800">avec 2 oudlers</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-lg text-center border-2 border-red-400">
                    <div className="text-3xl font-bold text-red-900 mb-1">51</div>
                    <div className="text-sm font-semibold text-red-800">avec 1 oudler</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg text-center border-2 border-purple-400">
                    <div className="text-3xl font-bold text-purple-900 mb-1">56</div>
                    <div className="text-sm font-semibold text-purple-800">sans oudler</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h3 className="font-bold text-blue-900 mb-2">Calcul du score</h3>
                  <div className="text-slate-700 space-y-1">
                    <p>Score de base = <strong>25 + écart avec le contrat</strong></p>
                    <p>Score final = <strong>Score de base × Multiplicateur du contrat</strong></p>
                    <p className="text-sm text-slate-600 mt-2">
                      Le preneur gagne ou perd ce score × 3 (car il joue contre 3 défenseurs)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <h2 className="text-3xl font-bold mb-4 text-center">Prêt à jouer ?</h2>
              <p className="text-center text-slate-300 mb-6">
                Maintenant que vous connaissez les règles, lancez une partie !
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => window.location.href = '/play'}
                >
                  Commencer une partie
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
