'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TableWithPlayers {
  id: string;
  status: string;
  maxPlayers: number;
  playerCount: number;
  createdAt: string;
}

export default function PlayPage() {
  const router = useRouter();
  const { user, createGuest, loading: authLoading } = useAuth();
  const [tables, setTables] = useState<TableWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTables() {
    try {
      const res = await fetch('/api/tables/list');
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickPlay() {
    try {
      setCreating(true);

      let currentUser = user;
      if (!currentUser) {
        await createGuest();
        const checkUser = async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
        };
        await checkUser();
        currentUser = user;
      }

      if (!currentUser) {
        toast.error('Veuillez vous connecter pour jouer');
        return;
      }

      const availableTable = tables.find(
        t => t.status === 'WAITING' && t.playerCount < 4
      );

      let tableId: string;

      if (availableTable) {
        tableId = availableTable.id;
      } else {
        const createRes = await fetch('/api/tables/create', {
          method: 'POST',
        });
        const createData = await createRes.json();

        if (!createData.table) {
          toast.error('Erreur lors de la création de la table');
          return;
        }

        tableId = createData.table.id;
      }

      const joinRes = await fetch(`/api/tables/${tableId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const joinData = await joinRes.json();

      if (!joinData.success) {
        toast.error('Erreur lors de la connexion à la table');
        return;
      }

      router.push(`/table/${tableId}`);
    } catch (error) {
      console.error('Error in quick play:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinTable(tableId: string) {
    try {
      let currentUser = user;
      if (!currentUser) {
        await createGuest();
        await new Promise(resolve => setTimeout(resolve, 500));
        currentUser = user;
      }

      if (!currentUser) {
        toast.error('Veuillez vous connecter pour jouer');
        return;
      }

      const joinRes = await fetch(`/api/tables/${tableId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const joinData = await joinRes.json();

      if (!joinData.success) {
        toast.error('Erreur lors de la connexion à la table');
        return;
      }

      router.push(`/table/${tableId}`);
    } catch (error) {
      console.error('Error joining table:', error);
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">Rejoindre une partie</h1>
            <p className="text-slate-600">
              Créez une nouvelle table ou rejoignez une partie en attente de joueurs
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleQuickPlay}
              disabled={creating || authLoading}
              className="text-lg px-8 py-6"
            >
              {creating ? 'Connexion...' : 'Jouer maintenant'}
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Tables disponibles</h2>

            {loading ? (
              <Card className="p-8 text-center text-slate-600">
                Chargement des tables...
              </Card>
            ) : tables.length === 0 ? (
              <Card className="p-8 text-center text-slate-600">
                Aucune table disponible. Créez-en une pour commencer !
              </Card>
            ) : (
              <div className="space-y-3">
                {tables.map((table) => (
                  <Card key={table.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">
                              {table.playerCount} / {table.maxPlayers} joueurs
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(table.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            table.status === 'WAITING'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {table.status === 'WAITING' ? 'En attente' : 'En cours'}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleJoinTable(table.id)}
                        disabled={table.playerCount >= 4 || table.status !== 'WAITING'}
                      >
                        {table.playerCount >= 4 ? 'Complète' : 'Rejoindre'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
