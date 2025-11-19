'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data || data.role !== 'admin') {
        router.push('/admin');
        return;
      }

      setIsAdmin(true);
      await loadSettings();
      setLoading(false);
    };

    checkAdmin();
  }, [user, router]);

  const loadSettings = async () => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key');

    if (data && !error) {
      setSettings(data.map(s => ({ ...s, value: s.value.toString() })));
    }
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Paramètres Système</h2>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Configuration des Distributions
          </h3>
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.key} className="border-b border-slate-200 pb-4 last:border-0">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {setting.description}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={setting.value}
                    readOnly
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Clé: <span className="font-mono">{setting.key}</span>
                </p>
              </div>
            ))}

            {settings.length === 0 && (
              <p className="text-slate-600 text-center py-4">
                Aucun paramètre configuré
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Informations
          </h3>
          <p className="text-sm text-blue-800">
            Les paramètres système sont configurés lors de la migration de la base de données.
            Pour modifier ces valeurs, vous devez mettre à jour directement la table system_settings
            dans Supabase.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
}
