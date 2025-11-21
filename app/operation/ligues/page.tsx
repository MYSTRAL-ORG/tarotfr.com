'use client';

import { useEffect, useState } from 'react';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Trophy, Users, Layers, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeagueStats {
  leagueId: number;
  leagueName: string;
  totalDivisions: number;
  totalPlayers: number;
}

export default function AdminLiguesPage() {
  const [stats, setStats] = useState<LeagueStats[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalDivisions, setTotalDivisions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: leagues } = await (await import('@/lib/supabase')).supabase
          .from('leagues')
          .select('*')
          .order('id', { ascending: true });

        if (!leagues) {
          setLoading(false);
          return;
        }

        const leagueStats: LeagueStats[] = [];
        let totalP = 0;
        let totalD = 0;

        for (const league of leagues) {
          const { data: divisions } = await (await import('@/lib/supabase')).supabase
            .from('league_divisions')
            .select('id')
            .eq('league_id', league.id);

          const divisionCount = divisions?.length || 0;

          const { data: activeSeason } = await (await import('@/lib/supabase')).supabase
            .from('league_seasons')
            .select('id')
            .eq('status', 'active')
            .maybeSingle();

          let playerCount = 0;
          if (activeSeason && divisions) {
            for (const division of divisions) {
              const { data: memberships } = await (await import('@/lib/supabase')).supabase
                .from('league_memberships')
                .select('id')
                .eq('division_id', division.id)
                .eq('season_id', activeSeason.id);

              playerCount += memberships?.length || 0;
            }
          }

          leagueStats.push({
            leagueId: league.id,
            leagueName: league.name,
            totalDivisions: divisionCount,
            totalPlayers: playerCount
          });

          totalP += playerCount;
          totalD += divisionCount;
        }

        setStats(leagueStats);
        setTotalPlayers(totalP);
        setTotalDivisions(totalD);
      } catch (error) {
        console.error('Error fetching league stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <AdminPageLayout
      title="Gestion des ligues"
      description="Gérez le système de ligues compétitives"
      icon={Trophy}
      loading={loading}
      stats={[
        {
          label: 'Joueurs actifs',
          value: totalPlayers,
          icon: Users,
          color: 'text-blue-600',
          description: 'Dans toutes les ligues'
        },
        {
          label: 'Total divisions',
          value: totalDivisions,
          icon: Layers,
          color: 'text-purple-600',
          description: 'Toutes ligues confondues'
        },
        {
          label: 'Ligues actives',
          value: 15,
          icon: Award,
          color: 'text-amber-600',
          description: 'De Bronze à Immortelle'
        }
      ]}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des joueurs par ligue</CardTitle>
              <CardDescription>
                Nombre de divisions et de joueurs dans chaque ligue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Ligue</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Divisions</TableHead>
                    <TableHead className="text-right">Joueurs</TableHead>
                    <TableHead className="text-right">Moy./Division</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((league) => (
                    <TableRow key={league.leagueId}>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {league.leagueId}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{league.leagueName}</TableCell>
                      <TableCell className="text-right">{league.totalDivisions}</TableCell>
                      <TableCell className="text-right font-semibold">{league.totalPlayers}</TableCell>
                      <TableCell className="text-right text-slate-600">
                        {league.totalDivisions > 0
                          ? Math.round(league.totalPlayers / league.totalDivisions)
                          : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Graphique de distribution</CardTitle>
              <CardDescription>
                Visualisation de la répartition des joueurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.map((league) => {
                  const percentage = totalPlayers > 0 ? (league.totalPlayers / totalPlayers) * 100 : 0;
                  return (
                    <div key={league.leagueId}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {league.leagueName}
                        </span>
                        <span className="text-sm text-slate-600">
                          {league.totalPlayers} joueurs ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Informations système</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Chaque division contient maximum 30 joueurs</li>
                  <li>• La ligue 1 peut avoir un nombre illimité de divisions</li>
                  <li>• Tous les nouveaux joueurs commencent en ligue 1</li>
                  <li>• Les promotions/relégations se font chaque fin de semaine</li>
                  <li>• Top 10 montent, milieu 10 restent, bottom 10 descendent</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Système de récompenses</CardTitle>
          <CardDescription>
            Récompenses distribuées en fin de saison selon le classement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Ligues 1-3</p>
              <p className="text-sm font-semibold">Top 3 récompensés</p>
              <p className="text-xs text-amber-600 mt-2">100 à 1,000 tokens</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Ligues 4-5</p>
              <p className="text-sm font-semibold">Top 5 récompensés</p>
              <p className="text-xs text-amber-600 mt-2">200 à 2,000 tokens</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Ligues 6-7</p>
              <p className="text-sm font-semibold">Top 7 récompensés</p>
              <p className="text-xs text-amber-600 mt-2">200 à 5,000 tokens</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Ligue 8</p>
              <p className="text-sm font-semibold">Top 9 récompensés</p>
              <p className="text-xs text-amber-600 mt-2">200 à 10,000 tokens</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Ligues 9-15</p>
              <p className="text-sm font-semibold">Top 10 récompensés</p>
              <p className="text-xs text-amber-600 mt-2">500 à 20,000 tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
