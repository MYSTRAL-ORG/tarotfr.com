'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spade, Users, Clock, Shield, Hash, Check, Trophy, BookOpen, FileText } from 'lucide-react';
import LandingPage from '@/components/LandingPage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [landingMode, setLandingMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    setIsAdmin(adminAuth === 'true');
    checkLandingMode();
  }, []);

  const checkLandingMode = async () => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    try {
      const query = supabase
        .from('site_settings')
        .select('landing_page_mode')
        .limit(1)
        .maybeSingle();

      const { data, error } = await Promise.race([query, timeout]) as any;

      if (error) {
        console.error('Error fetching landing mode:', error);
        setLandingMode(false);
      } else if (data) {
        setLandingMode(data.landing_page_mode || false);
      } else {
        setLandingMode(false);
      }
    } catch (error) {
      console.error('Error checking landing mode:', error);
      setLandingMode(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (landingMode && !isAdmin) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
            }}></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-12">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-6xl font-bold text-white leading-tight">
                  Jouez au Tarot en ligne
                </h1>
                <p className="text-2xl text-white/90">
                  Parties de Tarot à 4 en temps réel. Gratuit, rapide et sans inscription obligatoire.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="text-xl px-10 py-7 w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    onClick={() => router.push(user ? '/jouer' : '/compte')}
                  >
                    Jouer maintenant
                  </Button>
                  <Link href="/regles">
                    <Button size="lg" variant="outline" className="text-xl px-10 py-7 w-full sm:w-auto bg-white text-green-800 hover:bg-white/90 border-2 border-white">
                      Voir les règles
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center overflow-visible">
                <div className="relative w-64 h-96 overflow-visible">
                  <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                    <div
                      className="absolute w-full transition-all duration-700 hover:scale-110 hover:rotate-12 hover:translate-x-16 hover:z-30"
                      style={{
                        animation: 'cardFloat1 8s ease-in-out infinite',
                        zIndex: 3,
                      }}
                    >
                      <img
                        src="/img/cards/trumps/21.png"
                        alt="Trump 21"
                        className="w-full h-auto rounded-xl shadow-2xl"
                      />
                    </div>
                    <div
                      className="absolute w-full transition-all duration-700 hover:scale-110 hover:-rotate-0 hover:translate-y-8 hover:z-30"
                      style={{
                        animation: 'cardFloat2 8s ease-in-out infinite',
                        zIndex: 2,
                      }}
                    >
                      <img
                        src="/img/cards/excuse.png"
                        alt="Excuse"
                        className="w-full h-auto rounded-xl shadow-2xl"
                      />
                    </div>
                    <div
                      className="absolute w-full transition-all duration-700 hover:scale-110 hover:-rotate-12 hover:-translate-x-16 hover:z-30"
                      style={{
                        animation: 'cardFloat3 8s ease-in-out infinite',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src="/img/cards/trumps/1.png"
                        alt="Trump 1"
                        className="w-full h-auto rounded-xl shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Pourquoi jouer sur TarotFR ?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              La plateforme de référence pour jouer au Tarot en ligne. Une expérience de jeu optimale avec des fonctionnalités pensées pour les joueurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 border-b-4 border-red-600">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Users className="w-9 h-9" />
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              <h3 className="font-bold text-2xl">Multijoueur</h3>
              <p className="text-slate-600 text-lg font-medium">
                Jouez avec 3 autres joueurs du monde entier en temps réel
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 border-b-4 border-red-600">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-9 h-9" />
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              <h3 className="font-bold text-2xl">Temps réel</h3>
              <p className="text-slate-600 text-lg font-medium">
                Synchronisation instantanée pour une expérience de jeu fluide
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 border-b-4 border-red-600">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Spade className="w-9 h-9" />
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              <h3 className="font-bold text-2xl">Règles</h3>
              <p className="text-slate-600 text-lg font-medium">
                Tarot à 4 joueurs selon les <a href="https://wcgf.com/fr/tarot/rules" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:text-green-800 underline">règles officielles françaises</a>
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
            <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 border-b-4 border-red-600">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
              }}></div>
              <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-9 h-9" />
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              <h3 className="font-bold text-2xl">100% gratuit</h3>
              <p className="text-slate-600 text-lg font-medium">
                Jouez gratuitement, sans publicité ni limitation
              </p>
            </div>
          </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center space-y-6 p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                Distributions
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                Rejouez les donnes célèbres ou entraînez-vous sur des distributions spécifiques avec notre système unique de codes de distribution.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Code unique</span> - Chaque distribution possède un code partageable
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Reproductible</span> - Rejouez la même donne à l'infini
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Analyse</span> - Comparez vos résultats avec d'autres joueurs
                  </p>
                </div>
              </div>
              <div>
                <Link href="/distributions">
                  <Button size="lg" className="text-xl px-10 py-7 bg-red-600 hover:bg-red-700">
                    Découvrir les distributions
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center p-12">
              <div className="relative w-full rounded-2xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>
                  <div className="relative z-10 p-12">
                <div className="relative w-full max-w-md">
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-white/70 text-sm font-medium">Code de distribution</div>
                      <div className="text-white text-3xl font-mono font-bold tracking-wider bg-black/20 rounded-lg py-4 px-6">
                        #A7K9B2
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-white/90 bg-white/5 rounded-lg p-4">
                        <span className="text-sm">Parties jouées</span>
                        <span className="font-bold text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          247
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white/70 text-xs mb-1">Difficulté</div>
                          <div className="text-white font-bold">★★★☆☆</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white/70 text-xs mb-1">Taux de réussite</div>
                          <div className="text-white font-bold">42%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white rounded-2xl p-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Votre plateforme de Tarot en ligne
                </h2>
                <p className="text-xl text-slate-600">
                  Découvrez toutes les fonctionnalités qui font de notre site la référence pour jouer au Tarot français
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Modes de jeu variés
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Que vous soyez débutant ou joueur confirmé, notre plateforme s'adapte à votre niveau. Jouez contre des adversaires du monde entier en multijoueur temps réel, ou affinez votre stratégie face à nos bots intelligents dotés de différents niveaux de difficulté. Le mode tutoriel interactif vous guide pas à pas dans l'apprentissage des règles et des stratégies gagnantes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Système de distributions unique
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Notre système innovant de codes de distribution vous permet de rejouer les donnes célèbres, de partager vos parties mémorables avec vos amis, et d'analyser vos performances sur des configurations spécifiques. Chaque distribution est reproductible à l'infini grâce à son code unique partageable.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Espace membre et statistiques
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Créez votre compte pour suivre vos performances, consulter votre historique de parties, et comparer vos statistiques avec d'autres joueurs. Visualisez votre progression, votre taux de réussite selon les contrats, et identifiez les domaines à améliorer grâce à nos outils d'analyse détaillés.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Parties personnalisables
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Créez votre propre table de jeu, invitez vos amis via un lien unique, et personnalisez les règles selon vos préférences. Notre interface intuitive permet de gérer facilement les tables privées et publiques, avec un système de chat intégré pour communiquer avec les autres joueurs.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/tutoriel">
                  <Button size="lg" className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Découvrir le tutoriel
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden hover:border-red-600 transition-colors border-4 border-transparent rounded-2xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center space-y-6 p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                Le Tarot français
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                Un patrimoine ludique riche d'une histoire de plusieurs siècles, mêlant tradition et stratégie dans un jeu de cartes unique au monde.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Origines italiennes</span> - Né au XVe siècle dans l'aristocratie
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Tradition française</span> - Développé depuis le XVIe siècle
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-lg">
                    <span className="font-semibold">Jeu de stratégie</span> - Alliance, réflexion et psychologie
                  </p>
                </div>
              </div>
              <div>
                <Link href="/regles">
                  <Button size="lg" className="text-xl px-10 py-7 bg-red-600 hover:bg-red-700">
                    Consulter les règles
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center p-12">
              <div className="relative w-full rounded-2xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>
                  <div className="relative z-10 p-12">
                <div className="relative w-full max-w-md">
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-white/70 text-sm font-medium">Le saviez-vous ?</div>
                      <div className="text-white text-2xl font-bold">78 cartes uniques</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-white/90 bg-white/5 rounded-lg p-4">
                        <span className="text-sm">Atouts numérotés</span>
                        <span className="font-bold text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          21
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white/70 text-xs mb-1">Plis par partie</div>
                          <div className="text-white font-bold">18</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white/70 text-xs mb-1">Joueurs</div>
                          <div className="text-white font-bold">4</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="transform rotate-3">
                        <img
                          src="/img/cards/trumps/1.png"
                          alt="Atout 1"
                          className="w-full h-auto rounded-lg shadow-xl"
                        />
                      </div>
                      <div className="transform -rotate-2">
                        <img
                          src="/img/cards/trumps/21.png"
                          alt="Atout 21"
                          className="w-full h-auto rounded-lg shadow-xl"
                        />
                      </div>
                      <div className="transform rotate-2">
                        <img
                          src="/img/cards/excuse.png"
                          alt="Excuse"
                          className="w-full h-auto rounded-lg shadow-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 text-sm">
            <p>© 2024 TarotFR - Jeu de Tarot en ligne gratuit</p>
            <div className="flex gap-4 justify-center mt-2">
              <Link href="/regles" className="hover:text-slate-900">Règles</Link>
              <Link href="/jouer" className="hover:text-slate-900">Jouer</Link>
              <Link href="/compte" className="hover:text-slate-900">Compte</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
