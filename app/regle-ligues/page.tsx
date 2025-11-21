'use client';

import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, Award, Clock, Users } from 'lucide-react';

export default function LeagueRulesPage() {
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

  const rewardsByLeague = [
    { league: 1, positions: 3, maxReward: 500 },
    { league: 2, positions: 3, maxReward: 750 },
    { league: 3, positions: 3, maxReward: 1000 },
    { league: 4, positions: 5, maxReward: 1500 },
    { league: 5, positions: 5, maxReward: 2000 },
    { league: 6, positions: 7, maxReward: 3000 },
    { league: 7, positions: 7, maxReward: 5000 },
    { league: 8, positions: 9, maxReward: 10000 },
    { league: 9, positions: 10, maxReward: 20000 },
    { league: 10, positions: 10, maxReward: 20000 },
    { league: 11, positions: 10, maxReward: 20000 },
    { league: 12, positions: 10, maxReward: 20000 },
    { league: 13, positions: 10, maxReward: 20000 },
    { league: 14, positions: 10, maxReward: 20000 },
    { league: 15, positions: 10, maxReward: 20000 },
  ];

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
                  De la ligue Bronze à la ligue Immortelle
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Ligue</th>
                      <th className="px-6 py-4 text-left font-bold">Nom</th>
                      <th className="px-6 py-4 text-center font-bold">Top récompensés</th>
                      <th className="px-6 py-4 text-right font-bold">Récompense max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagues.map((league) => {
                      const reward = rewardsByLeague.find(r => r.league === league.id);
                      return (
                        <tr
                          key={league.id}
                          className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{league.icon}</span>
                              <Badge variant="outline" className="font-bold text-base">
                                {league.id}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">
                              {league.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {reward && (
                              <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                                Top {reward.positions}
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {reward && (
                              <div className="flex items-center justify-end gap-1">
                                <Award className="w-5 h-5 text-amber-600" />
                                <span className="font-bold text-green-700">
                                  {reward.maxReward.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Récompenses de fin de saison</h2>
                  <p className="text-lg text-slate-600 mt-2">
                    Gagnez des jetons selon votre classement final
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Ligues Débutantes (1-3)</h3>
                  <p className="text-slate-700 mb-3">Top 3 joueurs récompensés</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-yellow-600 font-bold text-2xl mb-1">🥇</div>
                      <div className="text-sm text-slate-600">500-1,000</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-gray-400 font-bold text-2xl mb-1">🥈</div>
                      <div className="text-sm text-slate-600">200-750</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-amber-700 font-bold text-2xl mb-1">🥉</div>
                      <div className="text-sm text-slate-600">100-500</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Ligues Intermédiaires (4-8)</h3>
                  <p className="text-slate-700 mb-3">Top 5 à 9 joueurs récompensés</p>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700 mb-2">200 à 10,000 jetons</div>
                    <p className="text-slate-600 text-sm">Récompenses progressives selon la position</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Ligues Élites (9-15)</h3>
                  <p className="text-slate-700 mb-3">Top 10 joueurs récompensés</p>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-700 mb-2">500 à 20,000 jetons</div>
                    <p className="text-slate-600 text-sm">Les plus grandes récompenses pour les meilleurs joueurs</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-600 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Durée des saisons</h3>
                </div>
                <div className="space-y-2 text-slate-700">
                  <p>
                    Chaque saison dure <strong className="text-blue-600">7 jours (1 semaine)</strong>.
                  </p>
                  <p>
                    À la fin de chaque saison, les promotions et relégations sont automatiquement calculées,
                    et une nouvelle saison commence immédiatement.
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Divisions</h3>
                </div>
                <div className="space-y-2 text-slate-700">
                  <p>
                    Chaque division contient <strong className="text-purple-600">maximum 30 joueurs</strong>.
                  </p>
                  <p>
                    La ligue 1 peut avoir un nombre illimité de divisions pour accueillir tous les nouveaux joueurs.
                    Les ligues supérieures se remplissent au fur et à mesure des promotions.
                  </p>
                </div>
              </Card>
            </div>

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
