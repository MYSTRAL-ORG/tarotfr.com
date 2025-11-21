'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, TrendingDown, Minus, Clock, Award, ChevronRight, Info } from 'lucide-react';
import { LeagueMembership, LeagueRanking, LeagueReward, LeagueHistory } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function LiguesPage() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<LeagueMembership | null>(null);
  const [rankings, setRankings] = useState<LeagueRanking[]>([]);
  const [rewards, setRewards] = useState<LeagueReward[]>([]);
  const [history, setHistory] = useState<LeagueHistory[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagueData() {
      try {
        // Try to get user's current league membership
        if (user) {
          const currentRes = await fetch(`/api/leagues/current?userId=${user.id}`);
          if (currentRes.ok) {
            const currentData = await currentRes.json();
            if (currentData.membership) {
              setMembership(currentData.membership);

              const rankingsRes = await fetch(
                `/api/leagues/rankings?divisionId=${currentData.membership.division_id}&userId=${user.id}`
              );
              if (rankingsRes.ok) {
                const rankingsData = await rankingsRes.json();
                setRankings(rankingsData.rankings);
                setRewards(rankingsData.rewards);
              }

              if (currentData.season && currentData.season.end_date) {
                const endDate = new Date(currentData.season.end_date);
                const updateTimeLeft = () => {
                  const now = new Date();
                  const diff = endDate.getTime() - now.getTime();

                  if (diff <= 0) {
                    setTimeLeft('Saison terminée');
                    return;
                  }

                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                  setTimeLeft(`${days}j ${hours}h ${minutes}m`);
                };

                updateTimeLeft();
                const interval = setInterval(updateTimeLeft, 60000);
                return () => clearInterval(interval);
              }
            }
          }

          const historyRes = await fetch(`/api/leagues/history?userId=${user.id}`);
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setHistory(historyData.history);
          }
        }

        // If no membership found, fetch first division of league 1 as example
        if (!membership) {
          const exampleRes = await fetch('/api/leagues/rankings?leagueId=1&divisionNumber=1');
          if (exampleRes.ok) {
            const exampleData = await exampleRes.json();
            setRankings(exampleData.rankings);
            setRewards(exampleData.rewards);
          }
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagueData();
  }, [user, membership]);

  const getPromotionZone = (rank: number) => {
    if (rank <= 10) return 'promotion';
    if (rank <= 20) return 'maintain';
    return 'relegation';
  };

  const getZoneColor = (zone: string) => {
    if (zone === 'promotion') return 'text-green-600 bg-green-50 border-green-200';
    if (zone === 'maintain') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getZoneIcon = (zone: string) => {
    if (zone === 'promotion') return <TrendingUp className="w-4 h-4" />;
    if (zone === 'maintain') return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getPromotionStatusBadge = (status: string) => {
    if (status === 'promoted') {
      return <Badge className="bg-green-600 hover:bg-green-700">Promu</Badge>;
    }
    if (status === 'relegated') {
      return <Badge className="bg-red-600 hover:bg-red-700">Relégué</Badge>;
    }
    return <Badge className="bg-blue-600 hover:bg-blue-700">Maintenu</Badge>;
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">Connectez-vous pour voir les ligues</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">Chargement...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const league = membership?.division?.league;
  const userRank = membership?.rank || 0;
  const zone = getPromotionZone(userRank);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-500" />
              Ligues Compétitives
            </h1>
            <p className="text-slate-600">
              {membership
                ? 'Affrontez les meilleurs joueurs chaque semaine pour gravir les échelons'
                : 'Aperçu de la Ligue Bronze - Division 1'
              }
            </p>
          </div>

          {membership ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Votre ligue</p>
                      <p className="text-2xl font-bold text-slate-900">{league?.name}</p>
                      <p className="text-xs text-slate-500">Division {membership.division?.divisionNumber}</p>
                    </div>
                    <Trophy className="w-12 h-12 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Votre classement</p>
                      <p className="text-2xl font-bold text-slate-900">#{userRank}</p>
                      <p className="text-xs text-slate-500">{membership.leaguePoints} points</p>
                    </div>
                    <div className={`p-3 rounded-full ${getZoneColor(zone)}`}>
                      {getZoneIcon(zone)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Fin de saison</p>
                      <p className="text-2xl font-bold text-slate-900">{timeLeft}</p>
                      <p className="text-xs text-slate-500">Saison {membership.season?.seasonNumber}</p>
                    </div>
                    <Clock className="w-12 h-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Rejoignez les ligues compétitives !
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Vous n&apos;êtes pas encore assigné à une ligue. Jouez votre première partie pour être automatiquement assigné à la Ligue Bronze !
                  </p>
                  <Link href="/jouer">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Trophy className="w-4 h-4 mr-2" />
                      Jouer maintenant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rankings">Classement</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {membership ? 'Classement de votre division' : 'Exemple de classement - Ligue Bronze Division 1'}
                  </CardTitle>
                  <CardDescription>
                    Top 10 montent | Milieu 10 restent | Bottom 10 descendent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rankings.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Aucun joueur dans cette division pour le moment</p>
                      <p className="text-sm text-slate-500">
                        Cette division sera remplie au fur et à mesure que les joueurs rejoignent les ligues
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rankings.map((ranking) => {
                      const zone = getPromotionZone(ranking.rank);
                      const reward = rewards.find(r => r.rank === ranking.rank);

                      return (
                        <div
                          key={ranking.userId}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            ranking.isCurrentUser
                              ? 'bg-blue-50 border-blue-500 shadow-md'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              ranking.rank === 1 ? 'bg-yellow-500 text-white' :
                              ranking.rank === 2 ? 'bg-slate-300 text-white' :
                              ranking.rank === 3 ? 'bg-amber-700 text-white' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {ranking.rank}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${ranking.isCurrentUser ? 'text-blue-900' : 'text-slate-900'}`}>
                                {ranking.displayName}
                                {ranking.isCurrentUser && ' (Vous)'}
                              </p>
                              <p className="text-sm text-slate-600">{ranking.leaguePoints} points</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {reward && (
                              <div className="flex items-center gap-1 text-amber-600 font-bold">
                                <Award className="w-4 h-4" />
                                {reward.rewardTokens}
                              </div>
                            )}
                            <div className={`px-3 py-1 rounded-full border-2 ${getZoneColor(zone)}`}>
                              {getZoneIcon(zone)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}

                  {rewards.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-3">Récompenses de fin de saison</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {rewards.slice(0, 10).map((reward) => (
                          <div key={reward.rank} className="text-center p-2 bg-white rounded border border-slate-200">
                            <p className="text-xs text-slate-600">#{reward.rank}</p>
                            <p className="font-bold text-amber-600">{reward.rewardTokens}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des saisons</CardTitle>
                  <CardDescription>Vos performances dans les saisons précédentes</CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-center text-slate-600 py-8">Aucun historique disponible</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                          <div>
                            <p className="font-semibold text-slate-900">{record.league?.name}</p>
                            <p className="text-sm text-slate-600">
                              Saison {record.season?.seasonNumber} - Position #{record.finalRank}
                            </p>
                            <p className="text-xs text-slate-500">{record.finalPoints} points</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {record.rewardTokens > 0 && (
                              <div className="flex items-center gap-1 text-amber-600 font-bold">
                                <Award className="w-4 h-4" />
                                {record.rewardTokens}
                              </div>
                            )}
                            {getPromotionStatusBadge(record.promotionStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Trophy className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">Comment fonctionnent les ligues ?</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      Les ligues sont un classement hebdomadaire d&apos;un groupe de 30 joueurs (division). Il existe 15 ligues numérotées de 1 à 15.
                    </p>
                    <p>
                      <strong>Chaque fin de semaine :</strong> Les 10 premiers montent, les 10 derniers descendent, les 10 du milieu restent.
                    </p>
                    <p>
                      Gagnez des points en jouant des parties. Plus votre classement est élevé, plus vos récompenses en tokens seront importantes !
                    </p>
                  </div>
                  <Link href="/regle-ligues">
                    <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                      <Info className="w-4 h-4 mr-2" />
                      En savoir plus sur les ligues
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
