'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spade, Users, Clock, Shield } from 'lucide-react';
import LandingPage from '@/components/LandingPage';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [landingMode, setLandingMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    setIsAdmin(adminAuth === 'true');
    checkLandingMode();
  }, []);

  const checkLandingMode = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('landing_page_mode')
        .limit(1)
        .maybeSingle();

      if (data) {
        setLandingMode(data.landing_page_mode);
      }
    } catch (error) {
      console.error('Error checking landing mode:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (landingMode && !isAdmin) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
            }}></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-12">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                  Jouez au Tarot en ligne
                </h1>
                <p className="text-2xl text-white/90">
                  Parties de Tarot à 4 en temps réel. Gratuit, rapide et sans inscription obligatoire.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/play">
                    <Button size="lg" className="text-xl px-10 py-7 w-full sm:w-auto bg-red-600 hover:bg-red-700">
                      Jouer maintenant
                    </Button>
                  </Link>
                  <Link href="/rules">
                    <Button size="lg" variant="outline" className="text-xl px-10 py-7 w-full sm:w-auto bg-white text-green-800 hover:bg-white/90 border-2 border-white">
                      Voir les règles
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { suit: 'hearts', rank: 14 },
                  { suit: 'spades', rank: 14 },
                  { suit: 'diamonds', rank: 14 },
                  { suit: 'clubs', rank: 14 },
                  { suit: 'hearts', rank: 1 },
                  { suit: 'spades', rank: 1 },
                  { suit: 'diamonds', rank: 1 },
                  { suit: 'clubs', rank: 1 },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer transition-all duration-300 hover:-translate-y-4"
                  >
                    <img
                      src={`/img/cards/base/${card.suit}/${card.rank}.png`}
                      alt={`${card.suit} ${card.rank}`}
                      className="w-full h-auto rounded-lg shadow-xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-4">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <div className="p-6 text-center space-y-3">
              <h3 className="font-semibold text-xl">Multijoueur</h3>
              <p className="text-slate-600 text-base">
                Jouez avec 3 autres joueurs du monde entier en temps réel
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-4">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
            </div>
            <div className="p-6 text-center space-y-3">
              <h3 className="font-semibold text-xl">Temps réel</h3>
              <p className="text-slate-600 text-base">
                Synchronisation instantanée pour une expérience de jeu fluide
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-4">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Spade className="w-7 h-7" />
              </div>
            </div>
            <div className="p-6 text-center space-y-3">
              <h3 className="font-semibold text-xl">Règles françaises</h3>
              <p className="text-slate-600 text-base">
                Tarot à 4 joueurs selon les règles officielles françaises
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-4">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7" />
              </div>
            </div>
            <div className="p-6 text-center space-y-3">
              <h3 className="font-semibold text-xl">100% gratuit</h3>
              <p className="text-slate-600 text-base">
                Jouez gratuitement, sans publicité ni limitation
              </p>
            </div>
          </Card>
        </div>
      </section>


      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 text-sm">
            <p>© 2024 TarotFR - Jeu de Tarot en ligne gratuit</p>
            <div className="flex gap-4 justify-center mt-2">
              <Link href="/rules" className="hover:text-slate-900">Règles</Link>
              <Link href="/play" className="hover:text-slate-900">Jouer</Link>
              <Link href="/account" className="hover:text-slate-900">Compte</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
