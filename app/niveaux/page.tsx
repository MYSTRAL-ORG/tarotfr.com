'use client';

import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Crown, Zap, Star, Award } from 'lucide-react';

export default function LevelsPage() {
  const levels = [
    {
      level: 1,
      name: 'Débutant',
      xpRequired: 0,
      color: 'from-gray-400 to-gray-600',
      icon: Star,
      description: 'Bienvenue dans le monde du Tarot! Apprenez les bases et familiarisez-vous avec les règles.',
      rewards: ['2000 jetons de départ', 'Accès aux salles Débutant'],
    },
    {
      level: 2,
      name: 'Apprenti',
      xpRequired: 100,
      color: 'from-green-400 to-green-600',
      icon: Star,
      description: 'Vous commencez à maîtriser les enchères et le comptage des points.',
      rewards: ['Déblocage de nouvelles salles', '+50 jetons bonus'],
    },
    {
      level: 3,
      name: 'Confirmé',
      xpRequired: 250,
      color: 'from-blue-400 to-blue-600',
      icon: Award,
      description: 'Votre stratégie s\'affine, vous comprenez les subtilités du jeu.',
      rewards: ['Accès aux salles Pro', 'Bonus XP +10%'],
    },
    {
      level: 4,
      name: 'Expert',
      xpRequired: 500,
      color: 'from-purple-400 to-purple-600',
      icon: Trophy,
      description: 'Vous maîtrisez les enchères avancées et anticipez les coups adverses.',
      rewards: ['Nouvelles salles débloquées', '+100 jetons bonus'],
    },
    {
      level: 5,
      name: 'Maître',
      xpRequired: 1000,
      color: 'from-orange-400 to-orange-600',
      icon: Crown,
      description: 'Un joueur redoutable capable de gérer les situations complexes.',
      rewards: ['Accès aux salles Légendes', 'Bonus XP +25%'],
    },
    {
      level: 10,
      name: 'Grand Maître',
      xpRequired: 6000,
      color: 'from-red-400 to-red-600',
      icon: Crown,
      description: 'L\'élite du Tarot. Votre expertise est reconnue de tous.',
      rewards: ['Toutes les salles débloquées', 'Badge spécial', '+500 jetons bonus'],
    },
    {
      level: 15,
      name: 'Légende',
      xpRequired: 17000,
      color: 'from-yellow-400 to-yellow-600',
      icon: Crown,
      description: 'Vous êtes entré dans la légende du Tarot. Peu atteignent ce niveau.',
      rewards: ['Salles VIP exclusives', 'Multiplicateur de gains +10%', 'Badge Légende'],
    },
    {
      level: 20,
      name: 'Champion',
      xpRequired: 30000,
      color: 'from-pink-400 to-pink-600',
      icon: Crown,
      description: 'Le sommet du Tarot. Vous êtes un véritable champion!',
      rewards: ['Accès aux tournois Champions', 'Récompenses exclusives', 'Badge Champion'],
    },
  ];

  const xpSources = [
    {
      action: 'Victoire en tant que preneur',
      xp: '+30 XP',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    {
      action: 'Victoire en tant que défenseur',
      xp: '+20 XP',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      action: 'Défaite en tant que preneur',
      xp: '+5 XP',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
    },
    {
      action: 'Défaite en tant que défenseur',
      xp: '+10 XP',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      action: 'Réaliser un petit au bout',
      xp: '+15 XP bonus',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    {
      action: 'Réaliser une Garde Contre',
      xp: '+50 XP bonus',
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
              Progressez, débloquez de nouvelles récompenses et devenez une légende du Tarot
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
                    Accumules de l&apos;XP pour <strong className="text-purple-700">débloquer de nouvelles salles</strong> et
                    des <strong className="text-green-700">récompenses exclusives</strong>.
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
                  <p className="text-lg text-slate-600 mt-2">Gagnez de l&apos;expérience en jouant</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {xpSources.map((source, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${source.color} flex justify-between items-center`}
                  >
                    <span className="font-semibold">{source.action}</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {source.xp}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-slate-700">
                  <strong>Astuce :</strong> Même en perdant, vous gagnez de l&apos;XP! L&apos;important est de jouer et
                  de s&apos;améliorer continuellement.
                </p>
              </div>
            </Card>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Les Niveaux</h2>
                <p className="text-lg text-slate-600">
                  Découvrez tous les niveaux et leurs récompenses
                </p>
              </div>

              {levels.map((lvl) => {
                const Icon = lvl.icon;
                return (
                  <Card key={lvl.level} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-3 bg-gradient-to-r ${lvl.color}`} />
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${lvl.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {lvl.level}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-slate-900">{lvl.name}</h3>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {lvl.xpRequired.toLocaleString()} XP
                            </Badge>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{lvl.description}</p>
                        </div>
                        <Icon className={`w-10 h-10 text-slate-400`} />
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          Récompenses débloquées
                        </h4>
                        <ul className="space-y-1">
                          {lvl.rewards.map((reward, index) => (
                            <li key={index} className="text-slate-600 flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              {reward}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
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
                    Chaque niveau débloque de nouvelles opportunités et des récompenses exclusives.
                    Plus vous jouez, plus vous vous améliorez, et plus les récompenses sont grandes!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
