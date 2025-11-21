'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, Award, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LeagueRulesPage() {
  const [expandedLeague, setExpandedLeague] = useState<number | null>(null);
  const leagues = [
    { id: 1, name: 'Ligue Bronze', color: 'from-amber-700 to-amber-900', icon: '🥉' },
    { id: 2, name: 'Ligue Argent', color: 'from-gray-400 to-gray-600', icon: '🥈' },
    { id: 3, name: 'Ligue Or', color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
    { id: 4, name: 'Ligue Platine', color: 'from-slate-400 to-slate-600', icon: '💎' },
    { id: 5, name: 'Ligue Émeraude', color: 'from-emerald-400 to-emerald-600', icon: '💚' },
    { id: 6, name: 'Ligue Diamant', color: 'from-cyan-400 to-cyan-600', icon: '💠' },
    { id: 7, name: 'Ligue Maître', color: 'from-purple-400 to-purple-600', icon: '👑' },
    { id: 8, name: 'Ligue Grand Maître', color: 'from-violet-400 to-violet-600', icon: '🎖️' },
    { id: 9, name: 'Ligue Challenger', color: 'from-red-400 to-red-600', icon: '⚔️' },
    { id: 10, name: 'Ligue Légende I', color: 'from-orange-400 to-orange-600', icon: '🌟' },
    { id: 11, name: 'Ligue Légende II', color: 'from-orange-500 to-orange-700', icon: '✨' },
    { id: 12, name: 'Ligue Légende III', color: 'from-orange-600 to-orange-800', icon: '💫' },
    { id: 13, name: 'Ligue Légende IV', color: 'from-red-500 to-red-700', icon: '🔥' },
    { id: 14, name: 'Ligue Légende V', color: 'from-red-600 to-red-800', icon: '⚡' },
    { id: 15, name: 'Ligue Immortelle', color: 'from-yellow-300 to-yellow-500', icon: '🏆' },
  ];

  const rewardsByLeague: { [key: number]: number[] } = {
    1: [500, 200, 100],
    2: [750, 500, 200],
    3: [1000, 750, 500],
    4: [1500, 1000, 750, 500, 200],
    5: [2000, 1500, 1000, 750, 500],
    6: [3000, 2000, 1500, 1000, 750, 500, 200],
    7: [5000, 3000, 2000, 1500, 1000, 750, 500],
    8: [10000, 5000, 3000, 2000, 1500, 1000, 750, 500, 200],
    9: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    10: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    11: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    12: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    13: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    14: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
    15: [20000, 15000, 10000, 5000, 3000, 2000, 1500, 1000, 750, 500],
  };

  const pointsSources = [
    {
      room: 'DÉBUTANT 1',
      points: '+5 pts',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'DÉBUTANT 2',
      points: '+8 pts',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'DÉBUTANT 3',
      points: '+10 pts',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'PRO 1',
      points: '+15 pts',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'PRO 2',
      points: '+20 pts',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'PRO 3',
      points: '+25 pts',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'LÉGENDES 1',
      points: '+30 pts',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'LÉGENDES 2',
      points: '+40 pts',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'LÉGENDES 3',
      points: '+50 pts',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'CYBORG 1',
      points: '+60 pts',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      room: 'CYBORG 2',
      points: '+80 pts',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      room: 'CYBORG 3',
      points: '+100 pts',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">
              Système de Ligues
            </h1>
            <p className="text-xl text-slate-600">
              Affrontez les meilleurs joueurs chaque semaine et gravissez les échelons
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-600 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-slate-900">Comment fonctionnent les ligues ?</h2>
                  <div className="space-y-3 text-lg text-slate-700 leading-relaxed">
                    <p>
                      Les ligues sont un <strong className="text-amber-700">classement hebdomadaire</strong> d&apos;un groupe
                      de 30 joueurs maximum appelé <strong className="text-purple-700">division</strong>. Il existe{' '}
                      <strong className="text-blue-700">15 ligues numérotées de 1 à 15</strong>, la ligue 1 étant celle de départ.
                    </p>
                    <p>
                      Chaque fin de semaine, les performances déterminent qui monte, qui descend ou qui reste :
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-green-600">Les 10 premiers</strong> de la division montent dans la ligue supérieure</li>
                      <li><strong className="text-blue-600">Les 10 du milieu</strong> restent dans leur ligue actuelle</li>
                      <li><strong className="text-red-600">Les 10 derniers</strong> descendent en ligue inférieure</li>
                    </ul>
                    <p>
                      La bataille pour monter en ligue supérieure est <strong className="text-red-600">très intense</strong>, et il vous
                      faudra beaucoup de victoires et de ténacité pour accéder à la ligue 15, la ligue ultime !
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Promotion</h3>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">Top 10</Badge>
                  <p className="text-slate-700">
                    Les 10 meilleurs joueurs montent dans la ligue supérieure
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Minus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Maintien</h3>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Rang 11-20</Badge>
                  <p className="text-slate-700">
                    Les joueurs du milieu restent dans la même ligue
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Relégation</h3>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">Bottom 10</Badge>
                  <p className="text-slate-700">
                    Les 10 derniers descendent en ligue inférieure
                  </p>
                </div>
              </Card>
            </div>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Comment gagner des points de ligue</h2>
                  <p className="text-lg text-slate-600 mt-2">Points gagnés par partie selon la salle</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {pointsSources.map((source, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${source.color} flex justify-between items-center`}
                  >
                    <span className="font-semibold">{source.room}</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {source.points}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-slate-700">
                  <strong>Astuce :</strong> Plus la salle est difficile, plus vous gagnez de points de ligue par partie!
                  Jouez dans les salles supérieures pour grimper plus rapidement dans les classements.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Les 15 Ligues</h2>
                <p className="text-lg text-slate-600">
                  De la ligue Bronze à la ligue Immortelle avec leurs récompenses
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-center font-bold w-20">Ligue</th>
                      <th className="px-6 py-4 text-left font-bold">Nom</th>
                      <th className="px-6 py-4 text-center font-bold w-32">Récompenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagues.map((league) => {
                      const rewards = rewardsByLeague[league.id] || [];
                      return (
                        <>
                          <tr
                            key={league.id}
                            className="border-b border-slate-200"
                          >
                            <td className="px-6 py-4 text-center">
                              <Badge variant="outline" className="font-bold text-base">
                                {league.id}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900">
                                {league.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm text-slate-600">Top {rewards.length}</span>
                            </td>
                          </tr>
                          <tr key={`${league.id}-rewards`}>
                            <td colSpan={3} className="px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-slate-200">
                              <div className="mb-2 flex items-center justify-center gap-2">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-slate-700">Récompenses en jetons par position</span>
                              </div>
                              <div className="grid grid-cols-10 gap-2">
                                {rewards.map((reward, idx) => (
                                  <div
                                    key={idx}
                                    className="text-center p-2 bg-white rounded border-2 border-amber-200 shadow-sm"
                                  >
                                    <div className="text-xs font-semibold text-slate-700 mb-1">#{idx + 1}</div>
                                    <div className="font-bold text-lg text-amber-600">
                                      {reward >= 1000 ? `${(reward / 1000).toFixed(0)}k` : reward}
                                    </div>
                                    <div className="text-xs text-slate-500">jetons</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Durée des saisons
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Chaque saison dure <strong className="text-blue-600">7 jours (1 semaine)</strong>.
                    À la fin de chaque saison, les promotions et relégations sont automatiquement calculées,
                    et une nouvelle saison commence immédiatement.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Organisation en divisions
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Chaque division contient <strong className="text-purple-600">maximum 30 joueurs</strong>.
                    La ligue 1 peut avoir un nombre illimité de divisions pour accueillir tous les nouveaux joueurs.
                    Les ligues supérieures se remplissent au fur et à mesure des promotions.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-600" />
                    Récompenses de fin de saison
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-3">
                    Les récompenses varient selon la ligue et votre position finale dans votre division :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                    <li><strong>Ligues 1-3 :</strong> Top 3 joueurs récompensés (de 100 à 1,000 jetons)</li>
                    <li><strong>Ligues 4-5 :</strong> Top 5 joueurs récompensés (de 200 à 2,000 jetons)</li>
                    <li><strong>Ligues 6-7 :</strong> Top 7 joueurs récompensés (de 200 à 5,000 jetons)</li>
                    <li><strong>Ligue 8 :</strong> Top 9 joueurs récompensés (de 200 à 10,000 jetons)</li>
                    <li><strong>Ligues 9-15 :</strong> Top 10 joueurs récompensés (de 500 à 20,000 jetons)</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-600 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Devenez une légende</h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Le système de ligues est conçu pour créer une compétition <strong className="text-amber-700">hebdomadaire intense</strong> entre
                    joueurs de niveau similaire. Seuls les compétiteurs acharnés pourront culminer en tête des hautes ligues sans se faire
                    détrôner. Montez les échelons, accumulez les victoires, et prouvez que vous méritez votre place parmi les{' '}
                    <strong className="text-yellow-600">Immortels</strong> !
                  </p>
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-slate-900">Jouez régulièrement</span>
                      </div>
                      <p className="text-sm text-slate-600">Plus vous jouez, plus vous accumulez de points de ligue</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-900">Visez le top 10</span>
                      </div>
                      <p className="text-sm text-slate-600">Finissez dans les 10 premiers pour monter de ligue</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
