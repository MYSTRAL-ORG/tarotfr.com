'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  TrendingUp,
  Zap,
  Target,
  Users,
  Brain,
  Sparkles,
  Shield,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

interface BotConfig {
  id: string;
  level: string;
  bidding_aggression: number;
  min_trumps_to_bid: number;
  oudler_weight: number;
  high_trump_threshold: number;
  risk_tolerance: number;
  dog_keep_oudlers: boolean;
  dog_keep_high_trumps: boolean;
  dog_discard_low_cards: boolean;
  dog_strategy_smart: number;
  lead_with_trumps_frequency: number;
  lead_prefer_low_cards: boolean;
  lead_test_opponents: boolean;
  try_to_win_trick: number;
  overtrump_aggression: number;
  points_threshold_to_win: number;
  excuse_use_strategy: number;
  excuse_save_for_last: boolean;
  team_play_awareness: number;
  help_partner_probability: number;
  block_taker_aggression: number;
  count_cards_played: boolean;
  predict_opponent_hands: boolean;
  adapt_to_game_progress: boolean;
  endgame_optimization: number;
  is_active: boolean;
}

export default function BotsPage() {
  const { toast } = useToast();
  const [botConfigs, setBotConfigs] = useState<BotConfig[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('easy');
  const [currentConfig, setCurrentConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBotConfigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bot_config')
        .select('*')
        .order('level');

      if (error) throw error;
      if (data) setBotConfigs(data);
    } catch (error) {
      console.error('Error loading bot configs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les configurations des bots',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBotConfigs();
  }, [loadBotConfigs]);

  useEffect(() => {
    const config = botConfigs.find(b => b.level === selectedLevel);
    if (config) {
      setCurrentConfig(config);
    }
  }, [selectedLevel, botConfigs]);

  const saveConfig = async () => {
    if (!currentConfig) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('bot_config')
        .update({
          ...currentConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentConfig.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Configuration du bot ${getLevelLabel(currentConfig.level)} sauvegardée`,
      });
      loadBotConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof BotConfig>(key: K, value: BotConfig[K]) => {
    if (!currentConfig) return;
    setCurrentConfig({ ...currentConfig, [key]: value });
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-red-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  if (loading || !currentConfig) {
    return (
      <AdminPageLayout
        title="Gestion des bots"
        description="Configurez le comportement des adversaires virtuels"
        icon={Bot}
        loading={true}
      >
        <div></div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Gestion des bots"
      description="Configurez le comportement des adversaires virtuels"
      icon={Bot}
      stats={[
        {
          label: 'Bots Configurés',
          value: botConfigs.length,
          icon: Bot
        },
        {
          label: 'Bots Actifs',
          value: botConfigs.filter(b => b.is_active).length,
          icon: Zap,
          color: 'text-green-600'
        },
        {
          label: 'Niveau Sélectionné',
          value: getLevelLabel(currentConfig.level),
          icon: TrendingUp,
          color: 'text-blue-600'
        }
      ]}
      actions={
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      }
    >

      <div className="flex gap-3">
        {botConfigs.map((bot) => (
          <Button
            key={bot.level}
            variant={selectedLevel === bot.level ? 'default' : 'outline'}
            onClick={() => setSelectedLevel(bot.level)}
            className="flex items-center gap-2"
          >
            <div className={`w-3 h-3 rounded-full ${getLevelColor(bot.level)}`}></div>
            Bot {getLevelLabel(bot.level)}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="bidding" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bidding">Enchères</TabsTrigger>
          <TabsTrigger value="dog">Écart</TabsTrigger>
          <TabsTrigger value="play">Jeu de cartes</TabsTrigger>
          <TabsTrigger value="team">Jeu d'équipe</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="bidding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comportement d'enchères
              </CardTitle>
              <CardDescription>
                Configurez comment le bot décide de ses enchères
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Agressivité des enchères</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.bidding_aggression}</span>
                </div>
                <Slider
                  value={[currentConfig.bidding_aggression]}
                  onValueChange={([value]) => updateConfig('bidding_aggression', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Plus élevé = enchérit plus souvent et avec des mains plus faibles
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Atouts minimum pour enchérir</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.min_trumps_to_bid}</span>
                </div>
                <Slider
                  value={[currentConfig.min_trumps_to_bid]}
                  onValueChange={([value]) => updateConfig('min_trumps_to_bid', value)}
                  min={3}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Nombre minimum d'atouts requis pour faire une enchère
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Importance des bouts</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.oudler_weight}</span>
                </div>
                <Slider
                  value={[currentConfig.oudler_weight]}
                  onValueChange={([value]) => updateConfig('oudler_weight', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Pondération accordée à la présence de bouts (Excuse, Petit, 21)
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Seuil atout majeur</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.high_trump_threshold}</span>
                </div>
                <Slider
                  value={[currentConfig.high_trump_threshold]}
                  onValueChange={([value]) => updateConfig('high_trump_threshold', value)}
                  min={10}
                  max={21}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  À partir de quelle valeur un atout est considéré comme "fort"
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tolérance au risque</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.risk_tolerance}</span>
                </div>
                <Slider
                  value={[currentConfig.risk_tolerance]}
                  onValueChange={([value]) => updateConfig('risk_tolerance', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Propension à prendre des risques avec des mains limites
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Gestion de l'écart
              </CardTitle>
              <CardDescription>
                Configurez comment le bot gère le chien et fait son écart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Conserver les bouts</Label>
                  <p className="text-xs text-slate-500">Garde l'Excuse, le Petit et le 21 dans son jeu</p>
                </div>
                <Switch
                  checked={currentConfig.dog_keep_oudlers}
                  onCheckedChange={(checked) => updateConfig('dog_keep_oudlers', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Conserver les atouts majeurs</Label>
                  <p className="text-xs text-slate-500">Garde les atouts forts dans son jeu</p>
                </div>
                <Switch
                  checked={currentConfig.dog_keep_high_trumps}
                  onCheckedChange={(checked) => updateConfig('dog_keep_high_trumps', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Écarter les petites cartes</Label>
                  <p className="text-xs text-slate-500">Privilégie l'écart des cartes sans valeur</p>
                </div>
                <Switch
                  checked={currentConfig.dog_discard_low_cards}
                  onCheckedChange={(checked) => updateConfig('dog_discard_low_cards', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Intelligence de l'écart</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.dog_strategy_smart}</span>
                </div>
                <Slider
                  value={[currentConfig.dog_strategy_smart]}
                  onValueChange={([value]) => updateConfig('dog_strategy_smart', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Capacité à optimiser l'écart selon la stratégie de jeu
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="play" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Jeu de cartes - En attaque
              </CardTitle>
              <CardDescription>
                Comportement quand le bot joue en premier dans un pli
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Fréquence d'attaque à l'atout</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.lead_with_trumps_frequency}</span>
                </div>
                <Slider
                  value={[currentConfig.lead_with_trumps_frequency]}
                  onValueChange={([value]) => updateConfig('lead_with_trumps_frequency', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  À quelle fréquence le bot commence un pli avec un atout
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Préférer les petites cartes</Label>
                  <p className="text-xs text-slate-500">Commence par les cartes de faible valeur</p>
                </div>
                <Switch
                  checked={currentConfig.lead_prefer_low_cards}
                  onCheckedChange={(checked) => updateConfig('lead_prefer_low_cards', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tester les adversaires</Label>
                  <p className="text-xs text-slate-500">Joue stratégiquement pour sonder les mains adverses</p>
                </div>
                <Switch
                  checked={currentConfig.lead_test_opponents}
                  onCheckedChange={(checked) => updateConfig('lead_test_opponents', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Jeu de cartes - En défense
              </CardTitle>
              <CardDescription>
                Comportement quand le bot répond à un pli déjà commencé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volonté de prendre le pli</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.try_to_win_trick}</span>
                </div>
                <Slider
                  value={[currentConfig.try_to_win_trick]}
                  onValueChange={([value]) => updateConfig('try_to_win_trick', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  À quel point le bot essaie de remporter les plis
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Agressivité de surcoupe</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.overtrump_aggression}</span>
                </div>
                <Slider
                  value={[currentConfig.overtrump_aggression]}
                  onValueChange={([value]) => updateConfig('overtrump_aggression', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Propension à surcouper avec des atouts forts
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Seuil de points pour prendre</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.points_threshold_to_win}</span>
                </div>
                <Slider
                  value={[currentConfig.points_threshold_to_win]}
                  onValueChange={([value]) => updateConfig('points_threshold_to_win', value)}
                  min={5}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Points minimum dans le pli pour essayer de le prendre
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Stratégie d'Excuse</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.excuse_use_strategy}</span>
                </div>
                <Slider
                  value={[currentConfig.excuse_use_strategy]}
                  onValueChange={([value]) => updateConfig('excuse_use_strategy', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Intelligence d'utilisation de l'Excuse (timing optimal)
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Garder l'Excuse pour la fin</Label>
                  <p className="text-xs text-slate-500">Privilégie la conservation de l'Excuse jusqu'aux derniers plis</p>
                </div>
                <Switch
                  checked={currentConfig.excuse_save_for_last}
                  onCheckedChange={(checked) => updateConfig('excuse_save_for_last', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Jeu d'équipe en défense
              </CardTitle>
              <CardDescription>
                Comportement du bot en tant que défenseur (quand il ne prend pas)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Conscience d'équipe</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.team_play_awareness}</span>
                </div>
                <Slider
                  value={[currentConfig.team_play_awareness]}
                  onValueChange={([value]) => updateConfig('team_play_awareness', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Capacité à reconnaître et coordonner avec les co-défenseurs
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Aide aux partenaires</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.help_partner_probability}</span>
                </div>
                <Slider
                  value={[currentConfig.help_partner_probability]}
                  onValueChange={([value]) => updateConfig('help_partner_probability', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Fréquence à laquelle le bot aide les partenaires à prendre des plis
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Agressivité anti-preneur</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.block_taker_aggression}</span>
                </div>
                <Slider
                  value={[currentConfig.block_taker_aggression]}
                  onValueChange={([value]) => updateConfig('block_taker_aggression', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Intensité des actions pour bloquer et contrer le preneur
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Capacités avancées
              </CardTitle>
              <CardDescription>
                Fonctionnalités d'intelligence artificielle et d'analyse avancée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mémorisation des cartes jouées</Label>
                  <p className="text-xs text-slate-500">Le bot se souvient de toutes les cartes déjà jouées</p>
                </div>
                <Switch
                  checked={currentConfig.count_cards_played}
                  onCheckedChange={(checked) => updateConfig('count_cards_played', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Prédiction des mains adverses</Label>
                  <p className="text-xs text-slate-500">Déduit la composition probable des mains adverses</p>
                </div>
                <Switch
                  checked={currentConfig.predict_opponent_hands}
                  onCheckedChange={(checked) => updateConfig('predict_opponent_hands', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Adaptation dynamique</Label>
                  <p className="text-xs text-slate-500">Ajuste sa stratégie selon l'évolution de la partie</p>
                </div>
                <Switch
                  checked={currentConfig.adapt_to_game_progress}
                  onCheckedChange={(checked) => updateConfig('adapt_to_game_progress', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Optimisation fin de partie</Label>
                  <span className="text-sm font-medium text-slate-600">{currentConfig.endgame_optimization}</span>
                </div>
                <Slider
                  value={[currentConfig.endgame_optimization]}
                  onValueChange={([value]) => updateConfig('endgame_optimization', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Capacité à calculer les meilleurs coups en fin de partie
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </AdminPageLayout>
  );
}
