'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ShopItem {
  id: string;
  tokens: number;
  price_eur: number;
  title: string;
  description: string;
  display_order: number;
}

interface UserWallet {
  tokens: number;
  level: number;
}

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchShopData();
  }, [user]);

  async function fetchShopData() {
    try {
      const itemsRes = await fetch('/api/shop/items');
      const itemsData = await itemsRes.json();

      if (itemsData.items) {
        setItems(itemsData.items);
      }

      if (user) {
        const walletRes = await fetch(`/api/wallet/${user.id}`);
        const walletData = await walletRes.json();

        if (walletData.wallet) {
          setWallet(walletData.wallet);
        }
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(item: ShopItem) {
    if (!user) {
      toast.error('Veuillez vous connecter pour acheter');
      router.push('/compte');
      return;
    }

    setPurchasing(item.id);

    try {
      toast.info('Redirection vers le paiement Stripe...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.error('Stripe non configuré. Ajoutez votre clé API Stripe pour activer les paiements.', {
        duration: 5000,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Erreur lors de l\'achat');
    } finally {
      setPurchasing(null);
    }
  }

  const tarotThemes = [
    { color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50', name: 'Le Bateleur', desc: 'Pour débuter votre aventure', card: 1 },
    { color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', name: 'La Papesse', desc: 'La sagesse des premières parties', card: 2 },
    { color: 'from-green-400 to-green-600', bgColor: 'bg-green-50', name: 'L\'Impératrice', desc: 'L\'abondance pour progresser', card: 3 },
    { color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50', name: 'Le Magicien', desc: 'Le pouvoir de la maîtrise', card: 11 },
    { color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50', name: 'L\'Empereur', desc: 'La richesse des grands maîtres', card: 4 },
    { color: 'from-red-400 to-red-600', bgColor: 'bg-red-50', name: 'Le Monde', desc: 'La plénitude absolue', card: 21 },
  ];

  const getBestValueIndex = () => {
    if (items.length === 0) return -1;
    let bestIndex = 0;
    let bestRatio = 0;

    items.forEach((item, index) => {
      const ratio = item.tokens / item.price_eur;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = index;
      }
    });

    return bestIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-2xl">Chargement...</div>
        </div>
      </div>
    );
  }

  const bestValueIndex = getBestValueIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)'
      }} />

      <Navigation />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">Boutique</h1>
            <p className="text-xl text-green-100">
              Achetez des jetons pour continuer votre quête
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/30"></div>
              <h2 className="text-2xl font-bold text-white tracking-wider">
                PACKS DE JETONS
              </h2>
              <div className="flex-1 h-px bg-white/30"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const isBestValue = index === bestValueIndex;
              const theme = tarotThemes[index] || tarotThemes[0];

              return (
                <Card
                  key={item.id}
                  className="bg-white/95 backdrop-blur overflow-hidden hover:shadow-xl transition-all"
                >
                  {isBestValue && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Meilleure offre
                      </Badge>
                    </div>
                  )}

                  <div className={`h-2 bg-gradient-to-r ${theme.color}`} />

                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="relative w-full h-32 mb-3 overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-2.5" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)'
                      }}>
                        <img
                          src={`/img/cards/trumps/${theme.card}.png`}
                          alt={theme.name}
                          className="w-full h-full object-cover object-top rounded-lg"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{theme.name}</h3>
                      <p className="text-xs text-slate-500">{theme.desc}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs text-slate-600 mb-1">Jetons inclus</div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="text-lg font-bold text-slate-900">
                            {item.tokens.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`bg-gradient-to-br ${theme.color} rounded-lg p-4 mb-4 text-white`}>
                      <div className="text-center">
                        <div className="text-sm opacity-90 mb-1">Prix</div>
                        <div className="text-3xl font-bold">
                          {item.price_eur.toFixed(2)} €
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {(item.tokens / item.price_eur).toFixed(0)} jetons/€
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handlePurchase(item)}
                      disabled={purchasing === item.id}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {purchasing === item.id ? 'Traitement...' : 'ACHETER'}
                    </Button>
                  </div>
                </Card>
              );
            })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm">
                Paiements sécurisés via Stripe • Tous les prix sont en euros TTC
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
