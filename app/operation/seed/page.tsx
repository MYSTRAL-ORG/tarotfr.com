'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OperationSeedPage() {
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(100);
  const [lastGeneration, setLastGeneration] = useState<{
    count: number;
    timestamp: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (count < 1 || count > 10000) {
      toast.error('Le nombre doit être entre 1 et 10000');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/distributions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.generated} distributions générées avec succès !`);
        setLastGeneration({
          count: data.generated,
          timestamp: new Date().toISOString(),
        });
      } else {
        toast.error(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Error generating distributions:', error);
      toast.error('Erreur lors de la génération des distributions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Générer des Distributions</h2>
        <p className="text-slate-600 mt-1">
          Créez de nouvelles distributions de cartes pour les parties
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Système de Distribution Déterministe
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Chaque distribution est générée de manière déterministe à partir d'un seed unique.
              Les joueurs peuvent vérifier l'équité des distributions en consultant le code hash
              après la partie. Les distributions sont pré-générées pour garantir des performances
              optimales en jeu.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="count" className="text-base font-semibold">
              Nombre de distributions à générer
            </Label>
            <p className="text-sm text-slate-600 mt-1 mb-3">
              Générez entre 1 et 10,000 distributions à la fois
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-xs">
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10000}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                  className="text-lg"
                  disabled={generating}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating || count < 1 || count > 10000}
                size="lg"
                className="px-8"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-5 h-5 mr-2" />
                    Générer
                  </>
                )}
              </Button>
            </div>
          </div>

          {lastGeneration && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">
                    Génération réussie
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {lastGeneration.count} distributions générées le{' '}
                    {new Date(lastGeneration.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
              Recommandations
            </h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Générez 1000-5000 distributions pour un usage normal</li>
              <li>• Les distributions sont uniques et vérifiables</li>
              <li>• La génération peut prendre quelques secondes pour les grands nombres</li>
              <li>• Consultez la page "Dashboard" pour voir les statistiques</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Comment ça marche ?
        </h3>
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">1. Génération du Seed</h4>
            <p>
              Chaque distribution commence par un numéro de distribution unique et un numéro de
              séquence. Ces deux nombres sont combinés pour créer un seed déterministe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">2. Shuffle Déterministe</h4>
            <p>
              Le seed est utilisé pour mélanger les 78 cartes du Tarot de manière reproductible.
              Le même seed produira toujours la même distribution.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">3. Code Hash</h4>
            <p>
              Un code hash unique est généré pour chaque distribution, permettant aux joueurs
              de vérifier l'intégrité de la distribution après la partie.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
