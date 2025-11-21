'use client';

import Link from 'next/link';
import { BookOpen, FileText, Trophy, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link
            href="/regles"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Règles du Jeu</span>
          </Link>

          <div className="hidden md:block w-px h-6 bg-white/20" />

          <Link
            href="/distributions"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Distributions</span>
          </Link>

          <div className="hidden md:block w-px h-6 bg-white/20" />

          <Link
            href="/ligues"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Ligues</span>
          </Link>

          <div className="hidden md:block w-px h-6 bg-white/20" />

          <Link
            href="/regle-ligues"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Award className="w-5 h-5" />
            <span className="font-medium">Règles des Ligues</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
