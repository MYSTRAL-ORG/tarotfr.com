'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Trophy, TrendingUp, LogIn, UserPlus, UserCheck } from 'lucide-react';

export default function AccountPage() {
  const { user, login, register, logout, createGuest, loading } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Connexion réussie !');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(registerEmail, registerPassword, registerDisplayName);
      toast.success('Inscription réussie !');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterDisplayName('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestPlay = async () => {
    setSubmitting(true);
    try {
      await createGuest();
      toast.success('Compte invité créé !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte invité');
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-slate-900">
                Mon Compte
              </h1>
              <p className="text-xl text-slate-600">
                Gérez votre profil et consultez vos statistiques
              </p>
            </div>

            <div className="space-y-8">
            <Card className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {user.displayName}
                  </h2>
                  {user.isGuest ? (
                    <p className="text-slate-600">Compte invité</p>
                  ) : (
                    <p className="text-slate-600">{user.email}</p>
                  )}
                </div>
              </div>

              {user.isGuest && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 mb-2">
                    Vous jouez en tant qu'invité. Créez un compte pour sauvegarder vos statistiques !
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Créer un compte
                  </Button>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={logout} variant="outline">
                  Déconnexion
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-900">0</div>
                <div className="text-sm text-slate-600">Parties jouées</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-900">0</div>
                <div className="text-sm text-slate-600">Victoires</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-900">0%</div>
                <div className="text-sm text-slate-600">Taux de victoire</div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-slate-900">
                Historique des parties
              </h2>
              <div className="text-center py-8 text-slate-500">
                Aucune partie jouée pour le moment
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation />

      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="login" className="w-full">
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-3 h-auto bg-white shadow-lg rounded-xl border-2 border-slate-200 p-2">
                <TabsTrigger
                  value="login"
                  className="flex flex-col items-center gap-2 py-4 rounded-lg transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <LogIn className="w-6 h-6" />
                  <span className="font-semibold">Connexion</span>
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex flex-col items-center gap-2 py-4 rounded-lg transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="font-semibold">Inscription</span>
                </TabsTrigger>
                <TabsTrigger
                  value="guest"
                  className="flex flex-col items-center gap-2 py-4 rounded-lg transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <UserCheck className="w-6 h-6" />
                  <span className="font-semibold">Invité</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="guest" className="mt-0">
              <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-2xl bg-white h-[600px]">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-12 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>
                  <div className="relative z-10 text-center">
                    <div className="mb-8 animate-bounce">
                      <img src="/img/cards/excuse.png" alt="Joker" className="w-48 h-auto mx-auto shadow-2xl rounded-lg" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Joker</h2>
                    <p className="text-xl text-white/90">Sois plus qu'un simple joker et rejoins-nous</p>
                  </div>
                </div>

                <div className="p-12 flex flex-col justify-center bg-white">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">Jouer en Invité</h1>
                      <p className="text-slate-600">Jouez immédiatement sans créer de compte</p>
                    </div>
                    <Button
                      onClick={handleGuestPlay}
                      disabled={submitting || loading}
                      size="lg"
                      className="w-full text-lg h-14"
                    >
                      Commencer à jouer
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="login" className="mt-0">
              <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-2xl bg-white h-[600px]">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-12 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>
                  <div className="relative z-10 text-center">
                    <div className="mb-8 animate-bounce">
                      <img src="/img/cards/trumps/21.png" alt="Atout 21" className="w-48 h-auto mx-auto shadow-2xl rounded-lg" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Enfin de retour !</h2>
                    <p className="text-xl text-white/90">Tu es le véritable atout du jeu</p>
                  </div>
                </div>

                <div className="p-12 flex flex-col justify-center bg-white">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">Connexion</h1>
                      <p className="text-slate-600">Bon retour parmi nous !</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="votre@email.com"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="h-12"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting || loading}
                      className="w-full text-lg h-12"
                    >
                      Se connecter
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <div className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-2xl bg-white h-[600px]">
                <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-12 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
                  }}></div>
                  <div className="relative z-10 text-center">
                    <div className="mb-8 animate-bounce">
                      <img src="/img/cards/trumps/1.png" alt="Atout 1" className="w-48 h-auto mx-auto shadow-2xl rounded-lg" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Rejoins la communauté</h2>
                    <p className="text-xl text-white/90">Des milliers de vrais joueurs de tarot français</p>
                  </div>
                </div>

                <div className="p-12 flex flex-col justify-center bg-white">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">Inscription</h1>
                      <p className="text-slate-600">Créez votre compte gratuitement</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nom d'utilisateur</Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerDisplayName}
                        onChange={(e) => setRegisterDisplayName(e.target.value)}
                        required
                        placeholder="Votre pseudo"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        placeholder="votre@email.com"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="h-12"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting || loading}
                      className="w-full text-lg h-12"
                    >
                      S'inscrire
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
