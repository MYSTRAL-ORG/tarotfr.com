'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Edit } from 'lucide-react';
import { AdminPageLayout, AdminSection } from '@/components/admin/AdminPageLayout';

export default function RulesPage() {
  return (
    <AdminPageLayout
      title="Gestion des règles"
      description="Configurez les règles du jeu"
      icon={BookOpen}
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une règle
        </Button>
      }
    >
      <AdminSection
        title="Règles du Tarot Français"
        description="Configuration actuelle"
        icon={BookOpen}
        actions={
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Nombre de joueurs</h4>
            <p>4 joueurs</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Cartes par joueur</h4>
            <p>18 cartes</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Taille du chien</h4>
            <p>6 cartes</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Contrats disponibles</h4>
            <p>Petite, Garde, Garde Sans, Garde Contre</p>
          </div>
        </div>
      </AdminSection>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Configuration avancée
          </CardTitle>
          <CardDescription>
            Cette section sera développée prochainement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Fonctionnalité en développement</p>
            <p className="text-sm mt-2">
              Personnalisation complète des règles et variantes du jeu
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
