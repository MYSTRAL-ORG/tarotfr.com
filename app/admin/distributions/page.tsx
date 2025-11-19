'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Distribution {
  id: string;
  hash_code: string;
  distribution_number: string;
  sequence_number: string;
  used_count: number;
  created_at: string;
}

export default function AdminDistributionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      await loadDistributions();
      setLoading(false);
    };

    checkAdmin();
  }, [user, router]);

  const loadDistributions = async () => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('card_distributions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setDistributions(data);
    }
  };

  const filteredDistributions = distributions.filter((d) =>
    d.hash_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.distribution_number.includes(searchTerm) ||
    d.sequence_number.includes(searchTerm)
  );

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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Distributions</h2>
        </div>

        <Card className="p-4">
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-slate-400 mt-2" />
            <Input
              type="text"
              placeholder="Rechercher par code, numéro de distribution ou séquence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Code Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Distribution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Séquence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Utilisations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredDistributions.map((dist) => (
                  <tr key={dist.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {dist.hash_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {dist.distribution_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {dist.sequence_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {dist.used_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(dist.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/distributions/${dist.hash_code}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDistributions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">Aucune distribution trouvée</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
