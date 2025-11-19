'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bot, Settings, Code, Variable } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface BotConfig {
  id: string;
  level: string;
  common_code: string;
  level_specific_code: string;
  variables: Record<string, number>;
  is_active: boolean;
}

export default function BotsPage() {
  const { toast } = useToast();
  const [botConfigs, setBotConfigs] = useState<BotConfig[]>([]);
  const [commonCode, setCommonCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);
  const [commonCodeDialogOpen, setCommonCodeDialogOpen] = useState(false);

  useEffect(() => {
    loadBotConfigs();
  }, []);

  const loadBotConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_config')
        .select('*')
        .order('level');

      if (error) throw error;

      if (data && data.length > 0) {
        setBotConfigs(data);
        setCommonCode(data[0].common_code || '');
      }
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
  };

  const saveCommonCode = async () => {
    try {
      const { error } = await supabase
        .from('bot_config')
        .update({ common_code: commonCode, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Code commun sauvegardé pour tous les bots',
      });
      setCommonCodeDialogOpen(false);
      loadBotConfigs();
    } catch (error) {
      console.error('Error saving common code:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le code commun',
        variant: 'destructive',
      });
    }
  };

  const saveBotConfig = async (botConfig: BotConfig) => {
    try {
      const { error } = await supabase
        .from('bot_config')
        .update({
          level_specific_code: botConfig.level_specific_code,
          variables: botConfig.variables,
          updated_at: new Date().toISOString()
        })
        .eq('id', botConfig.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Configuration du bot ${getLevelLabel(botConfig.level)} sauvegardée`,
      });
      setEditingBot(null);
      loadBotConfigs();
    } catch (error) {
      console.error('Error saving bot config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    }
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

  const updateVariable = (key: string, value: string) => {
    if (!editingBot) return;
    setEditingBot({
      ...editingBot,
      variables: {
        ...editingBot.variables,
        [key]: parseFloat(value) || 0,
      },
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des bots</h1>
          <p className="text-slate-600 mt-2">Configurez le comportement des adversaires virtuels</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Configuration avancée
              </CardTitle>
              <CardDescription>
                Gérez le code commun partagé par tous les niveaux de bots
              </CardDescription>
            </div>
            <Dialog open={commonCodeDialogOpen} onOpenChange={setCommonCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Éditer le code commun
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Code commun des bots</DialogTitle>
                  <DialogDescription>
                    Ce code est partagé par tous les niveaux de difficulté
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="common-code">Code JavaScript</Label>
                    <Textarea
                      id="common-code"
                      value={commonCode}
                      onChange={(e) => setCommonCode(e.target.value)}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="Entrez le code commun..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCommonCodeDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={saveCommonCode}>
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {botConfigs.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getLevelColor(bot.level)} mr-2`}></div>
                  Bot {getLevelLabel(bot.level)}
                </CardTitle>
                <Dialog open={editingBot?.id === bot.id} onOpenChange={(open) => {
                  if (open) {
                    setEditingBot(bot);
                  } else {
                    setEditingBot(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Configuration - Bot {getLevelLabel(bot.level)}</DialogTitle>
                      <DialogDescription>
                        Gérez le code spécifique et les variables pour ce niveau
                      </DialogDescription>
                    </DialogHeader>
                    {editingBot && (
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="level-code">Code spécifique</Label>
                          <Textarea
                            id="level-code"
                            value={editingBot.level_specific_code}
                            onChange={(e) => setEditingBot({ ...editingBot, level_specific_code: e.target.value })}
                            className="font-mono text-sm min-h-[300px]"
                            placeholder="Code JavaScript spécifique à ce niveau..."
                          />
                        </div>

                        <div>
                          <div className="flex items-center mb-3">
                            <Variable className="mr-2 h-4 w-4" />
                            <Label className="text-base font-semibold">Variables de configuration</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(editingBot.variables).map(([key, value]) => (
                              <div key={key}>
                                <Label htmlFor={`var-${key}`} className="text-sm">{key}</Label>
                                <Input
                                  id={`var-${key}`}
                                  type="number"
                                  step="0.1"
                                  value={value}
                                  onChange={(e) => updateVariable(key, e.target.value)}
                                  className="font-mono"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingBot(null)}>
                            Annuler
                          </Button>
                          <Button onClick={() => saveBotConfig(editingBot)}>
                            Sauvegarder
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Niveau : {getLevelLabel(bot.level)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{bot.is_active ? 'Actif' : 'Inactif'}</Badge>
              <div className="mt-4 text-sm text-slate-600">
                <p className="font-medium mb-1">Variables configurées :</p>
                <p className="text-xs">{Object.keys(bot.variables).length} paramètre(s)</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
