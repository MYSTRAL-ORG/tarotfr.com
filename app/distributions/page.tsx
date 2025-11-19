'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DistributionsPage() {
  const router = useRouter();
  const [hashCode, setHashCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hashCode.trim()) {
      toast.error('Veuillez entrer un code de distribution');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/distributions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashCode: hashCode.trim().toUpperCase() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          router.push(`/distributions/${hashCode.trim().toUpperCase()}`);
        } else {
          toast.error('Code de distribution introuvable');
        }
      } else {
        toast.error('Code de distribution introuvable');
      }
    } catch (error) {
      console.error('Error validating hash code:', error);
      toast.error('Erreur lors de la validation du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Consulter une Distribution
            </h1>
            <p className="text-lg text-slate-600">
              Entrez le code de distribution pour vérifier les cartes d'une partie
            </p>
          </div>

          <Card className="p-8 mb-6">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="hashCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Code de Distribution
                </label>
                <div className="flex gap-2">
                  <Input
                    id="hashCode"
                    type="text"
                    value={hashCode}
                    onChange={(e) => setHashCode(e.target.value.toUpperCase())}
                    placeholder="Exemple: A3X9K2F8"
                    className="flex-1 font-mono text-lg"
                    maxLength={12}
                  />
                  <Button type="submit" disabled={loading} className="px-8">
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Recherche...' : 'Rechercher'}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Le code de distribution est affiché en haut de l'écran de jeu pendant une partie.
              </div>
            </form>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Système de Vérification</p>
                <p>
                  Chaque partie de Tarot utilise un code unique pour garantir l'équité de la
                  distribution des cartes. Vous pourrez consulter toutes les mains une fois
                  la partie terminée.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
