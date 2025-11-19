'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

export default function MembersPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des membres</h1>
          <p className="text-slate-600 mt-2">Gérez les utilisateurs de votre application</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un membre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Liste des membres
          </CardTitle>
          <CardDescription>
            Cette section sera développée prochainement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Fonctionnalité en développement</p>
            <p className="text-sm mt-2">La gestion des membres sera bientôt disponible</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Membres actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Invités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
