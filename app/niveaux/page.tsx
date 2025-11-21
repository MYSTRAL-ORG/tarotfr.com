'use client';

import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Coins, Zap } from 'lucide-react';

export default function LevelsPage() {
  const levelData = [
    { level: 1, xp: 50, cumul: 50, reward: 500 },
    { level: 2, xp: 75, cumul: 125, reward: 500 },
    { level: 3, xp: 100, cumul: 225, reward: 500 },
    { level: 4, xp: 125, cumul: 350, reward: 500 },
    { level: 5, xp: 150, cumul: 500, reward: 500 },
    { level: 6, xp: 175, cumul: 675, reward: 500 },
    { level: 7, xp: 200, cumul: 875, reward: 500 },
    { level: 8, xp: 225, cumul: 1100, reward: 500 },
    { level: 9, xp: 500, cumul: 1600, reward: 1000 },
    { level: 10, xp: 550, cumul: 2150, reward: 1000 },
    { level: 11, xp: 600, cumul: 2750, reward: 1500 },
    { level: 12, xp: 650, cumul: 3400, reward: 1500 },
    { level: 13, xp: 700, cumul: 4100, reward: 1500 },
    { level: 14, xp: 750, cumul: 4850, reward: 1500 },
    { level: 15, xp: 800, cumul: 5650, reward: 1500 },
    { level: 16, xp: 850, cumul: 6500, reward: 2000 },
    { level: 17, xp: 900, cumul: 7400, reward: 2000 },
    { level: 18, xp: 950, cumul: 8350, reward: 2000 },
    { level: 19, xp: 1000, cumul: 9350, reward: 2000 },
    { level: 20, xp: 1100, cumul: 10450, reward: 2000 },
    { level: 21, xp: 1200, cumul: 11650, reward: 2500 },
    { level: 22, xp: 1300, cumul: 12950, reward: 2500 },
    { level: 23, xp: 1400, cumul: 14350, reward: 2500 },
    { level: 24, xp: 1500, cumul: 15850, reward: 2500 },
    { level: 25, xp: 1600, cumul: 17450, reward: 2500 },
    { level: 26, xp: 1700, cumul: 19150, reward: 3000 },
    { level: 27, xp: 1800, cumul: 20950, reward: 3000 },
    { level: 28, xp: 1900, cumul: 22850, reward: 3000 },
    { level: 29, xp: 2000, cumul: 24850, reward: 3000 },
    { level: 30, xp: 2000, cumul: 26850, reward: 3000 },
    { level: 31, xp: 2000, cumul: 28850, reward: 3500 },
    { level: 32, xp: 2000, cumul: 30850, reward: 3500 },
    { level: 33, xp: 2000, cumul: 32850, reward: 3500 },
    { level: 34, xp: 2000, cumul: 34850, reward: 3500 },
    { level: 35, xp: 3500, cumul: 38350, reward: 3500 },
  ];

  const getLevelName = (level: number) => {
    if (level <= 5) return 'Débutant';
    if (level <= 10) return 'Apprenti';
    if (level <= 15) return 'Confirmé';
    if (level <= 20) return 'Expert';
    if (level <= 25) return 'Maître';
    if (level <= 30) return 'Grand Maître';
    return 'Légende';
  };

  const getLevelColor = (level: number) => {
    if (level <= 5) return 'from-gray-400 to-gray-600';
    if (level <= 10) return 'from-green-400 to-green-600';
    if (level <= 15) return 'from-blue-400 to-blue-600';
    if (level <= 20) return 'from-purple-400 to-purple-600';
    if (level <= 25) return 'from-orange-400 to-orange-600';
    if (level <= 30) return 'from-red-400 to-red-600';
    return 'from-yellow-400 to-yellow-600';
  };

  const xpSources = [
    {
      room: 'DÉBUTANT 1',
      xp: '+10 XP',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'DÉBUTANT 2',
      xp: '+15 XP',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'DÉBUTANT 3',
      xp: '+20 XP',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      room: 'PRO 1',
      xp: '+30 XP',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'PRO 2',
      xp: '+45 XP',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'PRO 3',
      xp: '+60 XP',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      room: 'LÉGENDES 1',
      xp: '+80 XP',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'LÉGENDES 2',
      xp: '+150 XP',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'LÉGENDES 3',
      xp: '+200 XP',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      room: 'CYBORG 1',
      xp: '+300 XP',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      room: 'CYBORG 2',
      xp: '+500 XP',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      room: 'CYBORG 3',
      xp: '+800 XP',
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
              Système de Niveaux
            </h1>
            <p className="text-xl text-slate-600">
              Progressez, débloquez de nouvelles récompenses et montez en grade
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-slate-900">Comment gagner de l&apos;XP</h2>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Chaque partie jouée vous rapporte de l&apos;<strong className="text-blue-700">expérience (XP)</strong>.
                    Plus vous gagnez et plus vous réalisez des exploits, plus vous montez rapidement de niveau.
                    Accumulez de l&apos;XP pour <strong className="text-purple-700">monter de niveau</strong> et
                    gagner des <strong className="text-green-700">jetons bonus</strong> à chaque palier!
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Sources d&apos;XP</h2>
                  <p className="text-lg text-slate-600 mt-2">XP gagnés par partie selon la salle</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {xpSources.map((source, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${source.color} flex justify-between items-center`}
                  >
                    <span className="font-semibold">{source.room}</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {source.xp}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-slate-700">
                  <strong>Astuce :</strong> Plus la salle est difficile, plus vous gagnez d&apos;XP par partie!
                  Montez en niveau pour accéder aux salles supérieures et progresser plus rapidement.
                </p>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Tableau des Niveaux</h2>
                <p className="text-lg text-slate-600">
                  35 niveaux à débloquer avec des récompenses croissantes
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Niveau</th>
                      <th className="px-6 py-4 text-left font-bold">Titre</th>
                      <th className="px-6 py-4 text-right font-bold">XP Requis</th>
                      <th className="px-6 py-4 text-right font-bold">XP Total</th>
                      <th className="px-6 py-4 text-right font-bold">Récompense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelData.map((lvl, index) => {
                      const color = getLevelColor(lvl.level);
                      const name = getLevelName(lvl.level);
                      const isNewTier = index === 0 || getLevelName(levelData[index - 1].level) !== name;

                      return (
                        <tr
                          key={lvl.level}
                          className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                            isNewTier ? 'border-t-4 border-t-slate-400' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shadow-md`}>
                                {lvl.level}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold text-slate-900 ${isNewTier ? 'text-lg' : ''}`}>
                              {name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Zap className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-slate-900">{lvl.xp.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-slate-600 font-medium">{lvl.cumul.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Coins className="w-5 h-5 text-yellow-600" />
                              <span className="font-bold text-green-700">{lvl.reward.toLocaleString()}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Progressez à votre rythme</h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Le système de niveaux est conçu pour récompenser votre progression et votre engagement.
                    Chaque niveau vous rapporte des <strong>jetons bonus</strong> qui augmentent au fil de votre progression.
                    Plus vous jouez, plus vous montez en grade, et plus les récompenses sont généreuses!
                  </p>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 mb-1">500 jetons</div>
                      <div className="text-sm text-slate-600">Niveaux 1-8</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 mb-1">1000-2500 jetons</div>
                      <div className="text-sm text-slate-600">Niveaux 9-25</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 mb-1">3000-3500 jetons</div>
                      <div className="text-sm text-slate-600">Niveaux 26-35</div>
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
