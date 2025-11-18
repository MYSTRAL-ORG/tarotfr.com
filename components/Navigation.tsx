'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
      }}></div>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/img/icon.png"
            alt="TarotFR Icon"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <Image
            src="/img/logo.svg"
            alt="TarotFR"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/rules" className="text-white/90 hover:text-white font-medium transition-colors">
            Règles
          </Link>
          <Link href="/play" className="text-white/90 hover:text-white font-medium transition-colors">
            Jouer
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/account">
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
            <Link href="/account">
              <Button size="sm">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
