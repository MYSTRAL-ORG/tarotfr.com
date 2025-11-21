'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Target } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageLayout, AdminSection } from '@/components/admin/AdminPageLayout';

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
  enabled: boolean;
}

interface LevelConfig {
  level: number;
  xp_required: number;
  reward_tokens: number;
  unlocks_room: string | null;
}

export default function EconomyPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, levelsRes] = await Promise.all([
        fetch('/api/admin/room-types'),
        fetch('/api/admin/level-config')
      ]);

      if (!roomsRes.ok) {
        const errorText = await roomsRes.text();
        console.error('Room types error:', roomsRes.status, errorText);
        throw new Error(`Failed to fetch room types: ${roomsRes.status}`);
      }

      if (!levelsRes.ok) {
        const errorText = await levelsRes.text();
        console.error('Levels error:', levelsRes.status, errorText);
        throw new Error(`Failed to fetch levels: ${levelsRes.status}`);
      }

      const roomsData = await roomsRes.json();
      const levelsData = await levelsRes.json();

      setRoomTypes(roomsData.roomTypes || []);
      setLevelConfig(levelsData.levels || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(`Erreur: ${error.message || 'Erreur de chargement'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomType = async (roomType: RoomType) => {
    if (updating) return;
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/room-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomType)
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Type de salle mis à jour');
    } catch (error) {
      console.error('Error updating room type:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const updateLevelConfig = async (level: LevelConfig) => {
    if (updating) return;
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/level-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(level)
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Configuration niveau mise à jour');
    } catch (error) {
      console.error('Error updating level config:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Économie du Jeu"
        description="Gérer les types de salles et la progression des niveaux"
        icon={Coins}
      >
        <div className="text-center py-12 text-muted-foreground">
          <p>Chargement...</p>
        </div>
      </AdminPageLayout>
    );
  }

  const totalRooms = roomTypes.length;
  const enabledRooms = roomTypes.filter(r => r.enabled).length;
  const totalLevels = levelConfig.length;

  return (
    <AdminPageLayout
      title="Économie du Jeu"
      description="Gérer les types de salles et la progression des niveaux"
      icon={Coins}
      stats={[
        {
          label: 'Types de Salles',
          value: totalRooms,
          icon: Target,
        },
        {
          label: 'Salles Actives',
          value: enabledRooms,
          icon: Target,
          color: 'text-green-600'
        },
        {
          label: 'Niveaux Configurés',
          value: totalLevels,
          icon: TrendingUp,
        }
      ]}
    >
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Types de Salles</TabsTrigger>
          <TabsTrigger value="levels">Niveaux / XP</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          {roomTypes.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>Catégorie: {room.category}</CardDescription>
                  </div>
                  <Switch
                    checked={room.enabled}
                    onCheckedChange={(checked) => {
                      const updated = { ...room, enabled: checked };
                      setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      updateRoomType(updated);
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Buy-in (Jetons)</Label>
                    <Input
                      type="number"
                      value={room.buy_in}
                      onChange={(e) => {
                        const updated = { ...room, buy_in: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Récompense 1er</Label>
                    <Input
                      type="number"
                      value={room.reward_first}
                      onChange={(e) => {
                        const updated = { ...room, reward_first: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Récompense 2ème</Label>
                    <Input
                      type="number"
                      value={room.reward_second}
                      onChange={(e) => {
                        const updated = { ...room, reward_second: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Récompense Égalité</Label>
                    <Input
                      type="number"
                      value={room.reward_draw}
                      onChange={(e) => {
                        const updated = { ...room, reward_draw: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>XP Gagnée</Label>
                    <Input
                      type="number"
                      value={room.xp_reward}
                      onChange={(e) => {
                        const updated = { ...room, xp_reward: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Points de Ligue</Label>
                    <Input
                      type="number"
                      value={room.league_points}
                      onChange={(e) => {
                        const updated = { ...room, league_points: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau Minimum</Label>
                    <Input
                      type="number"
                      value={room.min_level}
                      onChange={(e) => {
                        const updated = { ...room, min_level: parseInt(e.target.value) || 1 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={room.sort_order}
                      onChange={(e) => {
                        const updated = { ...room, sort_order: parseInt(e.target.value) || 0 };
                        setRoomTypes(rooms => rooms.map(r => r.id === room.id ? updated : r));
                      }}
                      onBlur={() => updateRoomType(room)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <AdminSection
            title="Configuration des Niveaux"
            description="Définir l'XP requise pour chaque niveau et les récompenses"
          >
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 font-semibold pb-2 border-b sticky top-0 bg-background">
                <div>Niveau</div>
                <div>XP Requise</div>
                <div>Récompense Jetons</div>
                <div>Débloque Salle</div>
              </div>
              {levelConfig.map((level) => (
                <div key={level.level} className="grid grid-cols-4 gap-4 py-2 border-b">
                  <div className="flex items-center font-bold">
                    Niveau {level.level}
                  </div>
                  <Input
                    type="number"
                    value={level.xp_required}
                    onChange={(e) => {
                      const updated = { ...level, xp_required: parseInt(e.target.value) || 0 };
                      setLevelConfig(levels => levels.map(l => l.level === level.level ? updated : l));
                    }}
                    onBlur={() => updateLevelConfig(level)}
                  />
                  <Input
                    type="number"
                    value={level.reward_tokens}
                    onChange={(e) => {
                      const updated = { ...level, reward_tokens: parseInt(e.target.value) || 0 };
                      setLevelConfig(levels => levels.map(l => l.level === level.level ? updated : l));
                    }}
                    onBlur={() => updateLevelConfig(level)}
                  />
                  <Input
                    value={level.unlocks_room || ''}
                    onChange={(e) => {
                      const updated = { ...level, unlocks_room: e.target.value || null };
                      setLevelConfig(levels => levels.map(l => l.level === level.level ? updated : l));
                    }}
                    onBlur={() => updateLevelConfig(level)}
                    placeholder="Nom de la salle"
                  />
                </div>
              ))}
            </div>
          </AdminSection>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
