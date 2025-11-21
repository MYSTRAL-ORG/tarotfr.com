'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Lock, Coins, Trophy, Zap, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface RoomType {
  id: string;
  name: string;
  category: string;
  buy_in: number;
  reward_first: number;
  reward_second: number;
  reward_draw: number;
  xp_reward: number;
  league_points: number;
  min_level: number;
  sort_order: number;
}

interface UserWallet {
  tokens: number;
  xp: number;
  level: number;
  league_points: number;
}

export default function PlayPage() {
  const router = useRouter();
  const { user, createGuest } = useAuth();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchRoomsAndWallet();
  }, [user]);

  async function fetchRoomsAndWallet() {
    try {
      const roomsRes = await fetch('/api/rooms/list');
      const roomsData = await roomsRes.json();

      if (roomsData.rooms) {
        setRooms(roomsData.rooms);
      }

      if (user) {
        const walletRes = await fetch(`/api/wallet/${user.id}`);
        const walletData = await walletRes.json();

        if (walletData.wallet) {
          setWallet(walletData.wallet);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getXPProgress(): number {
    if (!wallet) return 0;
    const levelConfigs = [
      { level: 1, xp: 0 },
      { level: 2, xp: 100 },
      { level: 3, xp: 250 },
      { level: 4, xp: 500 },
      { level: 5, xp: 1000 },
      { level: 10, xp: 6000 },
      { level: 15, xp: 17000 },
      { level: 20, xp: 30000 },
      { level: 25, xp: 50000 },
    ];

    const currentLevelConfig = levelConfigs.find(c => c.level === wallet.level) || levelConfigs[0];
    const nextLevelConfig = levelConfigs.find(c => c.level === wallet.level + 1);

    if (!nextLevelConfig) return 100;

    const xpInLevel = wallet.xp - currentLevelConfig.xp;
    const xpNeeded = nextLevelConfig.xp - currentLevelConfig.xp;

    return Math.min((xpInLevel / xpNeeded) * 100, 100);
  }

  async function handleJoinRoom(room: RoomType) {
    try {
      setJoining(true);

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

      if (!wallet) {
        toast.error('Chargement du portefeuille...');
        return;
      }

      if (wallet.tokens < room.buy_in) {
        toast.error(`Jetons insuffisants! Il vous faut ${room.buy_in} jetons.`, {
          action: {
            label: 'Acheter',
            onClick: () => router.push('/shop')
          }
        });
        return;
      }

      if (wallet.level < room.min_level) {
        toast.error(`Niveau ${room.min_level} requis pour cette salle`);
        return;
      }

      const createRes = await fetch('/api/tables/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: room.id,
          buyIn: room.buy_in
        }),
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
        body: JSON.stringify({
          userId: currentUser.id,
          buyIn: room.buy_in
        }),
      });

      const joinData = await joinRes.json();

      if (!joinData.success) {
        toast.error(joinData.error || 'Erreur lors de la connexion à la table');
        return;
      }

      router.push(`/table/${tableId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setJoining(false);
    }
  }

  const roomsPerSlide = 3;
  const totalSlides = Math.ceil(rooms.length / roomsPerSlide);
  const currentSlideRooms = rooms.slice(
    currentRoomIndex * roomsPerSlide,
    (currentRoomIndex + 1) * roomsPerSlide
  );

  const currentCategory = currentSlideRooms.length > 0 ? currentSlideRooms[0].category : '';

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DEBUTANT': return 'from-green-500 to-green-600';
      case 'PRO': return 'from-blue-500 to-blue-600';
      case 'LEGENDES': return 'from-purple-500 to-purple-600';
      case 'CYBORG': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-2xl">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)'
      }} />

      <Navigation />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {wallet && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-white/95 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {wallet.level}
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Niveau {wallet.level}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                          style={{ width: `${getXPProgress()}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{Math.round(getXPProgress())}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <span className="text-2xl font-bold text-green-600">
                      {wallet.tokens.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    onClick={() => router.push('/shop')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Boutique
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">Points de Ligue:</span>
                  <span className="font-semibold text-slate-900">{wallet.league_points.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-slate-600">XP:</span>
                  <span className="font-semibold text-slate-900">{wallet.xp.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 text-white drop-shadow-lg">Choisir une Salle</h1>
            <p className="text-xl text-green-100">
              Sélectionnez votre niveau de jeu
            </p>
          </div>

          {rooms.length > 0 && currentSlideRooms.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1))}
                  disabled={currentRoomIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <div className="flex-1 max-w-6xl">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 h-px bg-white/30"></div>
                      <h2 className="text-2xl font-bold text-white tracking-wider">
                        {currentCategory}
                      </h2>
                      <div className="flex-1 h-px bg-white/30"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentSlideRooms.map((room) => {
                      const isRoomLocked = wallet ? (wallet.level < room.min_level) : false;
                      const hasEnoughTokens = wallet ? wallet.tokens >= room.buy_in : false;

                      return (
                        <Card key={room.id} className="bg-white/95 backdrop-blur overflow-hidden hover:shadow-xl transition-all">
                          <div className={`h-2 bg-gradient-to-r ${getCategoryColor(room.category)}`} />

                          <div className="p-6">
                            <div className="text-center mb-4">
                              <h3 className="text-2xl font-bold text-slate-900 mb-1">{room.name}</h3>
                              <div className="text-xs text-slate-500">4 joueurs</div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="bg-slate-50 rounded-lg p-3">
                                <div className="text-xs text-slate-600 mb-1">Mise d'entrée</div>
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-yellow-500" />
                                  <span className="text-lg font-bold text-slate-900">
                                    {room.buy_in.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                              <div className="text-xs font-semibold text-slate-700 mb-2">Récompenses</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">🥇 1ère place</span>
                                  <span className="font-bold text-green-600">+{room.reward_first.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">🥈 2ème place</span>
                                  <span className="font-bold text-blue-600">+{room.reward_second.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between text-xs">
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-purple-500" />
                                  <span className="text-slate-600">+{room.xp_reward} XP</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3 text-blue-500" />
                                  <span className="text-slate-600">+{room.league_points} PTS</span>
                                </div>
                              </div>
                            </div>

                            {isRoomLocked ? (
                              <div className="text-center py-3 px-4 bg-slate-100 rounded-lg">
                                <div className="flex items-center justify-center gap-2 text-slate-600">
                                  <Lock className="w-4 h-4" />
                                  <span className="text-sm font-semibold">Niveau {room.min_level} requis</span>
                                </div>
                              </div>
                            ) : (
                              <Button
                                className="w-full h-12 text-sm bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleJoinRoom(room)}
                                disabled={joining || !hasEnoughTokens}
                              >
                                {joining ? 'Connexion...' : !hasEnoughTokens ? 'Pas assez de jetons' : 'REJOINDRE'}
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => setCurrentRoomIndex(Math.min(totalSlides - 1, currentRoomIndex + 1))}
                  disabled={currentRoomIndex === totalSlides - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentRoomIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentRoomIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
