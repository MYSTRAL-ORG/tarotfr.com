'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, ShoppingCart, Sparkles, Crown, Star, Zap } from 'lucide-react';
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

  const getPackIcon = (index: number) => {
    const icons = [Coins, Sparkles, Star, Zap, Crown, Trophy];
    const Icon = icons[index] || Coins;
    return Icon;
  };

  const getPackColor = (index: number) => {
    const colors = [
      'from-gray-400 to-gray-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
    ];
    return colors[index] || colors[0];
  };

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
        {wallet && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-white/95 backdrop-blur p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Votre solde actuel</div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-8 h-8 text-yellow-500" />
                    <span className="text-4xl font-bold text-slate-900">
                      {wallet.tokens.toLocaleString()}
                    </span>
                    <span className="text-lg text-slate-600">jetons</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 mb-1">Niveau</div>
                  <div className="text-3xl font-bold text-orange-600">{wallet.level}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">Boutique</h1>
            <p className="text-xl text-green-100">
              Achetez des jetons pour continuer à jouer
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
              const ratio = (item.tokens / item.price_eur).toFixed(0);

              return (
                <Card
                  key={item.id}
                  className="relative bg-white/95 backdrop-blur overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {isBestValue && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Meilleure offre
                      </Badge>
                    </div>
                  )}

                  <div className={`h-32 bg-gradient-to-br ${getPackColor(index)} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                    <Coins className="w-20 h-20 text-white drop-shadow-lg relative z-10" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{item.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Jetons</span>
                        <div className="flex items-center gap-1">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="text-xl font-bold text-slate-900">
                            {item.tokens.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Prix</span>
                        <span className="text-2xl font-bold text-green-600">
                          €{item.price_eur.toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-xs text-slate-500 text-center">
                          Ratio: {ratio} jetons/€
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handlePurchase(item)}
                      disabled={purchasing === item.id}
                    >
                      {purchasing === item.id ? (
                        'Traitement...'
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Acheter
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
