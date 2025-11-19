'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Settings } from 'lucide-react';

export default function BotsPage() {
  const bots = [
    { name: 'Bot Facile', difficulty: 'Facile', status: 'Actif', color: 'bg-green-500' },
    { name: 'Bot Moyen', difficulty: 'Moyen', status: 'Actif', color: 'bg-yellow-500' },
    { name: 'Bot Difficile', difficulty: 'Difficile', status: 'Actif', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des bots</h1>
          <p className="text-slate-600 mt-2">Configurez les adversaires virtuels</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un bot
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${bot.color} mr-2`}></div>
                  {bot.name}
                </CardTitle>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Niveau : {bot.difficulty}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{bot.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            Configuration avancée
          </CardTitle>
          <CardDescription>
            Cette section sera développée prochainement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Fonctionnalité en développement</p>
            <p className="text-sm mt-2">
              Paramètres avancés pour personnaliser le comportement des bots
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
