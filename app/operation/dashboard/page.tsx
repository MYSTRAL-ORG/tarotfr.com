'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bot, BookOpen, Settings } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { icon: Users, label: 'Membres', value: '0', color: 'text-blue-600' },
    { icon: Bot, label: 'Bots', value: '3', color: 'text-green-600' },
    { icon: BookOpen, label: 'Règles', value: '1', color: 'text-purple-600' },
    { icon: Settings, label: 'Paramètres', value: 'OK', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600 mt-2">Vue d'ensemble de votre application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue dans le panneau d'administration</CardTitle>
          <CardDescription>
            Gérez tous les aspects de votre application de Tarot depuis cet espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Utilisez le menu latéral pour accéder aux différentes sections de l'administration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
