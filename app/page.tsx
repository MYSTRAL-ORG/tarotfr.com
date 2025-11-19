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

  useEffect(() => {
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

  if (landingMode) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
            Jouez au Tarot en ligne
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Parties de Tarot à 4 en temps réel. Gratuit, rapide et sans inscription obligatoire.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/play">
              <Button size="lg" className="text-lg px-8 py-6">
                Jouer maintenant
              </Button>
            </Link>
            <Link href="/rules">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Voir les règles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Multijoueur</h3>
            <p className="text-slate-600 text-sm">
              Jouez avec 3 autres joueurs du monde entier en temps réel
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Temps réel</h3>
            <p className="text-slate-600 text-sm">
              Synchronisation instantanée pour une expérience de jeu fluide
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center mx-auto">
              <Spade className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">Règles françaises</h3>
            <p className="text-slate-600 text-sm">
              Tarot à 4 joueurs selon les règles officielles françaises
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg">100% gratuit</h3>
            <p className="text-slate-600 text-sm">
              Jouez gratuitement, sans publicité ni limitation
            </p>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-900">
            Comment jouer ?
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Créez ou rejoignez une table</h4>
                <p className="text-slate-600">
                  Cliquez sur "Jouer maintenant" pour rejoindre automatiquement une partie
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Attendez 3 autres joueurs</h4>
                <p className="text-slate-600">
                  La partie commence dès que 4 joueurs sont présents et prêts
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Enchérissez et jouez</h4>
                <p className="text-slate-600">
                  Faites vos enchères, prenez le chien et jouez vos cartes à tour de rôle
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link href="/play">
              <Button size="lg">
                Commencer maintenant
              </Button>
            </Link>
          </div>
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
