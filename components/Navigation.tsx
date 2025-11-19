'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();

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
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/rules" className="text-white/90 hover:text-white font-medium transition-colors">
            Règles
          </Link>
          <Link href="/tutorial" className="text-white/90 hover:text-white font-medium transition-colors">
            Tutoriel
          </Link>
          <Link href="/distributions" className="text-white/90 hover:text-white font-medium transition-colors">
            Distributions
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
