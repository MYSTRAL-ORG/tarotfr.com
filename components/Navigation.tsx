'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Users, BookOpen, GraduationCap, FileText, Play, LogOut, LogIn, Coins, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserWallet {
  tokens: number;
  level: number;
}

export function Navigation() {
  const { user, logout } = useAuth();
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [wallet, setWallet] = useState<UserWallet | null>(null);

  console.log('Navigation render - user:', user, 'wallet:', wallet);

  useEffect(() => {
    const calculateOnlinePlayers = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutes = hour * 60 + minute;

      // 00:01 = 1 minute, 20:00 = 1200 minutes
      const peakTime = 20 * 60; // 20h00
      const lowTime = 1; // 00:01

      let players;
      if (totalMinutes <= peakTime) {
        // From 00:01 to 20:00: increase from 100 to 500
        const progress = (totalMinutes - lowTime) / (peakTime - lowTime);
        players = Math.round(100 + (progress * 400));
      } else {
        // From 20:00 to 23:59: decrease from 500 to 100
        const minutesUntilMidnight = (24 * 60) - totalMinutes;
        const minutesAfterPeak = (24 * 60) - peakTime;
        const progress = minutesUntilMidnight / minutesAfterPeak;
        players = Math.round(500 - ((1 - progress) * 400));
      }

      setOnlinePlayers(Math.max(100, Math.min(500, players)));
    };

    calculateOnlinePlayers();
    const interval = setInterval(calculateOnlinePlayers, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('useEffect triggered - user:', user);

    async function fetchWallet() {
      if (!user) return;

      try {
        console.log('Fetching wallet for user:', user.id);
        const res = await fetch(`/api/wallet/${user.id}`);
        const data = await res.json();
        console.log('Wallet response:', data);
        if (data.wallet) {
          setWallet(data.wallet);
          console.log('Wallet loaded:', data.wallet);
        }
      } catch (error) {
        console.error('Error fetching wallet:', error);
      }
    }

    if (user) {
      fetchWallet();
      const interval = setInterval(fetchWallet, 10000);
      return () => clearInterval(interval);
    } else {
      setWallet(null);
    }
  }, [user]);

  return (
    <nav className="border-b-4 border-red-600 bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
      }}></div>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 md:gap-4">
          <Image
            src="/img/icon.png"
            alt="TarotFR Icon"
            width={56}
            height={56}
            className="h-10 w-10 md:h-14 md:w-14 object-contain"
            priority
          />
          <Image
            src="/img/logo.svg"
            alt="TarotFR"
            width={160}
            height={56}
            className="h-14 w-auto hidden md:block"
            priority
          />
          <div className="h-10 w-px bg-white/30 ml-2 hidden md:block"></div>
          <div className="text-white/90 text-sm font-medium hidden md:block">
            <span className="text-green-300 mr-1">{onlinePlayers}</span> joueurs en ligne
          </div>
          <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium md:hidden">
            <Users className="w-4 h-4 text-green-300" />
            <span className="text-green-300">{onlinePlayers}</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/regles" className="text-white/90 hover:text-white font-medium transition-colors" title="Règles">
            <span className="hidden md:inline">Règles</span>
            <BookOpen className="w-5 h-5 md:hidden" />
          </Link>
          <Link href="/distributions" className="text-white/90 hover:text-white font-medium transition-colors" title="Distributions">
            <span className="hidden md:inline">Distributions</span>
            <FileText className="w-5 h-5 md:hidden" />
          </Link>
          {user && (
            <Link href="/jouer" className="text-white/90 hover:text-white font-medium transition-colors" title="Jouer">
              <span className="hidden md:inline">Jouer</span>
              <Play className="w-5 h-5 md:hidden" />
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              {wallet && (
                <>
                  <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-md flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-bold text-sm">
                      {wallet.tokens.toLocaleString()}
                    </span>
                    <Link href="/shop">
                      <button className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center text-white text-xs font-bold transition-colors">
                        +
                      </button>
                    </Link>
                  </div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-md flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {wallet.level}
                    </div>
                    <span className="text-white font-semibold text-sm hidden md:inline">
                      Niv. {wallet.level}
                    </span>
                  </div>
                </>
              )}
              <Link href="/compte">
                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 text-gray-900 border-white hover:border-blue-200">
                  <User className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{user.displayName}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout} className="bg-white hover:bg-blue-50 text-gray-900 border-white hover:border-blue-200" title="Déconnexion">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/compte">
              <Button size="sm" className="bg-white hover:bg-blue-50 text-gray-900" title="Se connecter">
                <LogIn className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Se connecter</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
