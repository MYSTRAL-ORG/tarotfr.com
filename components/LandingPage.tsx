'use client';

import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
      }}></div>
      <header className="w-full border-b-4 border-red-600 bg-gradient-to-br from-green-700 via-green-800 to-green-900 relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
        }}></div>
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/img/icon.png"
                alt="Tarot Icon"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <Image
                src="/img/logo.svg"
                alt="Tarot Logo"
                width={160}
                height={56}
                className="h-14 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 relative z-10">
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

      <footer className="w-full border-t-4 border-red-600 bg-gradient-to-br from-green-700 via-green-800 to-green-900 py-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)',
        }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-center text-white/90 text-sm">
            © {new Date().getFullYear()} Tarot en ligne. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
