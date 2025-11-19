'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spade, Users, Clock, Shield, Hash, Check, Trophy } from 'lucide-react';
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

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
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
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Votre plateforme complète de Tarot en ligne
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
            </div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white rounded-2xl p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Le Tarot français, un patrimoine ludique
                </h2>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Origines historiques
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Le Tarot trouve ses origines en Italie au XVe siècle, où il était initialement un jeu de cartes aristocratique. Il s'est progressivement répandu en France à partir du XVIe siècle, où il a connu une évolution majeure pour devenir le jeu que nous connaissons aujourd'hui.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Le Tarot en France
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    En France, le Tarot s'est particulièrement développé au XVIIIe siècle et est devenu un véritable phénomène culturel au XXe siècle. Avec ses 78 cartes dont 21 atouts, l'Excuse, et quatre couleurs traditionnelles, le Tarot français se distingue par sa richesse stratégique et la complexité de ses annonces. Aujourd'hui, il reste l'un des jeux de cartes les plus populaires dans l'Hexagone, pratiqué aussi bien en famille qu'en compétition.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Un jeu de stratégie et de convivialité
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Le Tarot combine habilement hasard et réflexion, mémoire et psychologie. Se jouant traditionnellement à quatre, il oppose un preneur contre trois défenseurs, créant une dynamique unique où alliance et confrontation se mêlent à chaque pli. Cette richesse tactique en fait un jeu inépuisable qui continue de passionner des millions de joueurs.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-2xl overflow-hidden p-8">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>

                  <div className="relative z-10 space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl p-6">
                      <h4 className="text-white text-xl font-bold mb-3">Le saviez-vous ?</h4>
                      <ul className="space-y-3 text-white/90 text-base">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>Le Tarot utilise 78 cartes, dont 21 atouts numérotés</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>L'Excuse est la seule carte sans valeur fixe</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>Une partie se joue en 18 plis de 4 cartes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>Le preneur doit réaliser 41 points minimum avec le Petit au bout pour gagner une Petite</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>Les figures et atouts valent plus de points que les petites cartes</span>
                        </li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="transform rotate-3">
                        <img
                          src="/img/cards/trumps/1.png"
                          alt="Atout 1"
                          className="w-full h-auto rounded-lg shadow-xl"
                        />
                      </div>
                      <div className="transform -rotate-2 mt-4">
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
