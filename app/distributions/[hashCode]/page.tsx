'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TarotCard as TarotCardComponent } from '@/components/game/TarotCard';
import { TarotCard } from '@/lib/types';
import { ArrowLeft, Copy, CheckCircle2, Lock, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface DistributionData {
  id: string;
  distributionNumber: string;
  sequenceNumber: string;
  hashCode: string;
  usedCount: number;
  createdAt: string;
  hands: Record<number, TarotCard[]> | null;
  dog: TarotCard[] | null;
  canViewDetails: boolean;
  gamesPlayed: number;
}

export default function DistributionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hashCode = params.hashCode as string;

  const [distribution, setDistribution] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await fetch(`/api/distributions/${hashCode}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Distribution introuvable');
            router.push('/distributions');
          } else {
            toast.error('Erreur lors du chargement de la distribution');
          }
          return;
        }

        const data = await response.json();
        setDistribution(data);
      } catch (error) {
        console.error('Error fetching distribution:', error);
        toast.error('Erreur lors du chargement de la distribution');
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [hashCode, router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hashCode);
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!distribution) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/distributions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la recherche
          </Button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Distribution {hashCode}
                </h1>
                <p className="text-slate-600">
                  {distribution.canViewDetails
                    ? 'Cette distribution a été utilisée dans des parties terminées'
                    : 'Distribution en attente ou en cours d\'utilisation'}
                </p>
              </div>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le code
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Hash className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Numéro de Distribution</p>
                  <p className="font-mono font-semibold text-slate-900">
                    {distribution.distributionNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Hash className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Numéro de Séquence</p>
                  <p className="font-mono font-semibold text-slate-900">
                    {distribution.sequenceNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Date de création</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(distribution.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {!distribution.canViewDetails && (
            <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
              <Lock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-900 mb-2">
                Détails Non Disponibles
              </h3>
              <p className="text-yellow-700">
                Les détails des mains ne sont accessibles qu'une fois la partie terminée
                pour garantir l'équité du jeu.
              </p>
              {distribution.gamesPlayed > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  {distribution.gamesPlayed} partie(s) en cours avec cette distribution
                </p>
              )}
            </Card>
          )}

          {distribution.canViewDetails && distribution.hands && distribution.dog && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((playerIndex) => {
                  const playerHand = distribution.hands?.[playerIndex];
                  if (!playerHand) return null;

                  return (
                    <Card key={playerIndex} className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Joueur {playerIndex + 1} (Position {playerIndex})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {playerHand.map((card) => (
                          <div key={card.id} className="transform hover:scale-105 transition-transform">
                            <TarotCardComponent card={card} size="sm" />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-slate-500 mt-4">
                        {playerHand.length} cartes
                      </p>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Le Chien (6 cartes)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {distribution.dog?.map((card) => (
                    <div key={card.id} className="transform hover:scale-105 transition-transform">
                      <TarotCardComponent card={card} size="sm" />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          <Card className="p-6 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Informations Complémentaires
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Cette distribution a été utilisée dans <strong>{distribution.gamesPlayed}</strong> partie(s)</p>
              <p>Identifiant unique: <span className="font-mono">{distribution.id}</span></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
