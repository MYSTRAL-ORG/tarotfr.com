'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Edit } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des règles</h1>
          <p className="text-slate-600 mt-2">Configurez les règles du jeu</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une règle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Règles du Tarot Français</CardTitle>
              <CardDescription>Configuration actuelle</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Nombre de joueurs</h4>
                <p className="text-slate-600">4 joueurs</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Cartes par joueur</h4>
                <p className="text-slate-600">18 cartes</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Taille du chien</h4>
                <p className="text-slate-600">6 cartes</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Contrats disponibles</h4>
                <p className="text-slate-600">Petite, Garde, Garde Sans, Garde Contre</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Configuration avancée
          </CardTitle>
          <CardDescription>
            Cette section sera développée prochainement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Fonctionnalité en développement</p>
            <p className="text-sm mt-2">
              Personnalisation complète des règles et variantes du jeu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
