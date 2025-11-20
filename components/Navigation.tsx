'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navigation() {
  const { user, logout } = useAuth();
  const [onlinePlayers, setOnlinePlayers] = useState(0);

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

  return (
    <nav className="border-b-4 border-red-600 bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
      }}></div>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/img/icon.png"
            alt="TarotFR Icon"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
          <Image
            src="/img/logo.svg"
            alt="TarotFR"
            width={160}
            height={56}
            className="h-14 w-auto"
            priority
          />
          <div className="h-10 w-px bg-white/30 ml-2"></div>
          <div className="text-white/90 text-sm font-medium">
            <span className="text-green-300 mr-1">{onlinePlayers}</span> joueurs en ligne
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/regles" className="text-white/90 hover:text-white font-medium transition-colors">
            Règles
          </Link>
          <Link href="/tutoriel" className="text-white/90 hover:text-white font-medium transition-colors">
            Tutoriel
          </Link>
          <Link href="/distributions" className="text-white/90 hover:text-white font-medium transition-colors">
            Distributions
          </Link>
          {user && (
            <Link href="/jouer" className="text-white/90 hover:text-white font-medium transition-colors">
              Jouer
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/compte">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user.displayName}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <Link href="/compte">
              <Button size="sm">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
