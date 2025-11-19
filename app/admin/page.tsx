'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Database, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Stats {
  totalDistributions: number;
  usedDistributions: number;
  totalGames: number;
  recentDistributions: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalDistributions: 0,
    usedDistributions: 0,
    totalGames: 0,
    recentDistributions: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await loadStats();
      setLoading(false);
    };

    checkAdmin();
  }, [user, router]);

  const loadStats = async () => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count: totalDist } = await supabase
      .from('card_distributions')
      .select('*', { count: 'exact', head: true });

    const { count: usedDist } = await supabase
      .from('card_distributions')
      .select('*', { count: 'exact', head: true })
      .gt('used_count', 0);

    const { count: totalGamesCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentDist } = await supabase
      .from('card_distributions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    setStats({
      totalDistributions: totalDist || 0,
      usedDistributions: usedDist || 0,
      totalGames: totalGamesCount || 0,
      recentDistributions: recentDist || 0,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Distributions</span>
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalDistributions}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Distributions Utilisées</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.usedDistributions}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Parties Totales</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalGames}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">7 Derniers Jours</span>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.recentDistributions}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Bienvenue dans le Back-Office</h2>
          <p className="text-slate-600 mb-4">
            Cet espace d'administration vous permet de gérer et suivre toutes les distributions
            de cartes générées par le système.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Consultez toutes les distributions créées</li>
            <li>• Vérifiez les statistiques d'utilisation</li>
            <li>• Analysez les patterns de jeu</li>
            <li>• Configurez les paramètres du système</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
}
