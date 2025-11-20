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
  const [creatingNew, setCreatingNew] = useState(false);

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

      const availableTables = tables
        .filter(t => t.status === 'WAITING' && t.playerCount < 4)
        .sort((a, b) => b.playerCount - a.playerCount);

      let tableId: string;

      if (availableTables.length > 0) {
        tableId = availableTables[0].id;
        toast.success(`Table trouvée avec ${availableTables[0].playerCount} joueur(s)`);
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
        toast.success('Nouvelle table créée');
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

  async function handleCreateTable() {
    try {
      setCreatingNew(true);

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

      const createRes = await fetch('/api/tables/create', {
        method: 'POST',
      });
      const createData = await createRes.json();

      if (!createData.table) {
        toast.error('Erreur lors de la création de la table');
        return;
      }

      const tableId = createData.table.id;

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

      toast.success('Table créée avec succès');
      router.push(`/table/${tableId}`);
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setCreatingNew(false);
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-900">Rejoindre une partie</h1>
            <p className="text-xl text-slate-600">
              Créez une nouvelle table ou rejoignez une partie en attente de joueurs
            </p>
          </div>

          <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="destructive"
              onClick={handleCreateTable}
              disabled={creatingNew || authLoading}
              className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700"
            >
              {creatingNew ? 'Création...' : 'Créer une table'}
            </Button>
            <Button
              size="lg"
              onClick={handleQuickPlay}
              disabled={creating || authLoading}
              className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
            >
              {creating ? 'Connexion...' : 'Jouer maintenant'}
            </Button>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tables disponibles</h2>

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
                {tables
                  .sort((a, b) => b.playerCount - a.playerCount)
                  .map((table) => (
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
                              {table.createdAt
                                ? new Date(table.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '--:--'
                              }
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
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
