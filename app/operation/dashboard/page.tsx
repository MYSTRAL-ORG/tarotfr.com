'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, CheckCircle2, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Stats {
  totalDistributions: number;
  usedDistributions: number;
  totalGames: number;
  activeGames: number;
  completedGames: number;
  todayDistributions: number;
}

interface DailyData {
  date: string;
  count: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalDistributions: 0,
    usedDistributions: 0,
    totalGames: 0,
    activeGames: 0,
    completedGames: 0,
    todayDistributions: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const statsPromises = Promise.all([
        supabase.from('card_distributions').select('*', { count: 'exact', head: true }),
        supabase.from('card_distributions').select('*', { count: 'exact', head: true }).gt('used_count', 0),
        supabase.from('tables').select('*', { count: 'exact', head: true }),
        supabase.from('tables').select('*', { count: 'exact', head: true }).eq('status', 'IN_GAME'),
        supabase.from('tables').select('*', { count: 'exact', head: true }).eq('status', 'FINISHED'),
        supabase.from('card_distributions').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      ]);

      const chartPromise = supabase.from('card_distributions').select('created_at').gte('created_at', sevenDaysAgo.toISOString());

      const [
        [
          { count: totalDist },
          { count: usedDist },
          { count: totalGames },
          { count: activeGames },
          { count: completedGames },
          { count: todayDist }
        ],
        { data: recentDist }
      ] = await Promise.all([statsPromises, chartPromise]);

      setStats({
        totalDistributions: totalDist || 0,
        usedDistributions: usedDist || 0,
        totalGames: totalGames || 0,
        activeGames: activeGames || 0,
        completedGames: completedGames || 0,
        todayDistributions: todayDist || 0,
      });

      const distributions = recentDist || [];
      const last7Days: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = distributions.filter((d: any) => {
          const created = new Date(d.created_at);
          return created >= date && created < nextDate;
        }).length;

        last7Days.push({
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          count
        });
      }
      setDailyData(last7Days);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <AdminPageLayout
      title="Tableau de bord"
      description="Statistiques en temps réel du système de distributions"
      icon={BarChart3}
      loading={loading}
      stats={[
        {
          label: 'Total Distributions',
          value: stats.totalDistributions.toLocaleString(),
          icon: Database,
          color: 'text-blue-600',
          description: `${stats.usedDistributions} utilisées`
        },
        {
          label: 'Parties Totales',
          value: stats.totalGames.toLocaleString(),
          icon: Activity,
          color: 'text-green-600',
          description: `${stats.activeGames} en cours`
        },
        {
          label: 'Parties Terminées',
          value: stats.completedGames.toLocaleString(),
          icon: CheckCircle2,
          color: 'text-purple-600',
          description: `${Math.round((stats.completedGames / (stats.totalGames || 1)) * 100)}% du total`
        },
        {
          label: 'Aujourd\'hui',
          value: stats.todayDistributions.toLocaleString(),
          icon: TrendingUp,
          color: 'text-orange-600',
          description: 'Nouvelles distributions'
        }
      ]}
    >

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distributions créées (7 derniers jours)</CardTitle>
            <CardDescription>Nombre de distributions générées par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des distributions</CardTitle>
            <CardDescription>Tendance de création sur 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
          <CardDescription>Informations clés du système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Taux d'utilisation des distributions</p>
                <p className="text-sm text-slate-600">
                  {stats.totalDistributions > 0
                    ? `${Math.round((stats.usedDistributions / stats.totalDistributions) * 100)}% des distributions ont été utilisées`
                    : 'Aucune distribution générée'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Parties actives</p>
                <p className="text-sm text-slate-600">
                  {stats.activeGames} partie{stats.activeGames > 1 ? 's' : ''} en cours de jeu
                </p>
              </div>
            </div>

            {stats.totalDistributions < 100 && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Action recommandée</p>
                  <p className="text-sm text-slate-600">
                    Niveau de distributions faible. Il est recommandé de générer plus de distributions via la page "Générer Seeds".
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
