import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { Toaster } from '@/components/ui/sonner';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TarotFR - Jeu de Tarot en Ligne Gratuit',
  description: 'Jouez au Tarot à 4 en ligne gratuitement. Parties en temps réel avec des joueurs du monde entier.',
  keywords: 'tarot, jeu de tarot, tarot en ligne, tarot gratuit, jeu de cartes, tarot à 4',
  icons: {
    icon: '/img/icon.png',
    apple: '/img/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <WebSocketProvider>
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
