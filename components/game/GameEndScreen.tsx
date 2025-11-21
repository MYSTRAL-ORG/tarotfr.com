'use client';

import { Player } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Trophy, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PlayerReward {
  userId: string;
  tokens: number;
  xp: number;
  leaguePoints: number;
  position: number;
}

interface GameEndScreenProps {
  players: Player[];
  totalScores: Record<number, number>;
  rewards: Record<string, PlayerReward>;
  currentUserId: string;
}

export function GameEndScreen({
  players,
  totalScores,
  rewards,
  currentUserId,
}: GameEndScreenProps) {
  const router = useRouter();
  const [showRewards, setShowRewards] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = totalScores[a.seatIndex] || 0;
    const scoreB = totalScores[b.seatIndex] || 0;
    return scoreB - scoreA;
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '4️⃣';
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-slate-300 to-slate-500';
    }
  };

  const currentPlayerReward = rewards[currentUserId];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRewards(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="max-w-4xl w-full py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 animate-bounce">
            Partie Terminée!
          </h1>
          <p className="text-xl text-slate-300">Résultats finaux</p>
        </div>

        <Card className="bg-white/95 backdrop-blur p-8 mb-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Classement Final</h2>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const position = index + 1;
              const score = totalScores[player.seatIndex] || 0;
              const reward = rewards[player.userId];
              const isCurrentPlayer = player.userId === currentUserId;

              return (
                <div
                  key={player.userId}
                  className={`relative overflow-hidden rounded-lg ${
                    isCurrentPlayer ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <div className={`h-2 bg-gradient-to-r ${getPositionColor(position)}`} />
                  <div className="bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{getPositionIcon(position)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900">
                              {player.displayName}
                            </span>
                            {isCurrentPlayer && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600">
                            Score: <span className="font-semibold">{score} points</span>
                          </div>
                        </div>
                      </div>

                      {reward && showRewards && (
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <Coins className="w-5 h-5 text-yellow-500" />
                              <span
                                className={`text-xl font-bold ${
                                  reward.tokens >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {reward.tokens >= 0 ? '+' : ''}
                                {reward.tokens.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-sm">
                              <Zap className="w-4 h-4 text-purple-500" />
                              <span className="text-slate-600">
                                +{reward.xp} XP
                              </span>
                            </div>
                          </div>
                          {reward.tokens >= 0 ? (
                            <TrendingUp className="w-8 h-8 text-green-500" />
                          ) : (
                            <TrendingDown className="w-8 h-8 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {currentPlayerReward && showRewards && (
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 mb-6 text-white">
            <h2 className="text-3xl font-bold text-center mb-6">Vos Récompenses</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <Coins className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                <div className="text-sm text-white/80 mb-1">Jetons</div>
                <div
                  className={`text-3xl font-bold ${
                    currentPlayerReward.tokens >= 0 ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {currentPlayerReward.tokens >= 0 ? '+' : ''}
                  {currentPlayerReward.tokens.toLocaleString()}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <Zap className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                <div className="text-sm text-white/80 mb-1">Expérience</div>
                <div className="text-3xl font-bold text-purple-300">
                  +{currentPlayerReward.xp}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-blue-300" />
                <div className="text-sm text-white/80 mb-1">Points de Ligue</div>
                <div className="text-3xl font-bold text-blue-300">
                  +{currentPlayerReward.leaguePoints}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/jouer')}
            className="px-8 bg-white/90 hover:bg-white"
          >
            Retour au Lobby
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/jouer')}
            className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Rejouer
          </Button>
        </div>
      </div>
    </div>
  );
}
