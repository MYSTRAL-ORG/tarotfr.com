'use client';

import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="w-full bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/img/icon.png"
                alt="Tarot Icon"
                width={40}
                height={40}
                className="rounded"
              />
              <Image
                src="/img/logo.svg"
                alt="Tarot Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <Image
              src="/img/icon.png"
              alt="Tarot Icon"
              width={200}
              height={200}
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div className="space-y-4">
            <Image
              src="/img/logo.svg"
              alt="Tarot Logo"
              width={300}
              height={100}
              className="mx-auto"
            />
          </div>
        </div>
      </main>

      <footer className="w-full bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Tarot en ligne. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
