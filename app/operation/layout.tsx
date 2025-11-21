'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Settings,
  Users,
  Bot,
  BookOpen,
  LogOut,
  Menu,
  X,
  Home,
  Database,
  Coins,
  ShoppingBag
} from 'lucide-react';

export default function OperationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (pathname !== '/operation' && auth !== 'true') {
      router.push('/operation');
    } else {
      setIsAuthenticated(auth === 'true');
      setIsLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    router.push('/operation');
  };

  if (isLoading) {
    return null;
  }

  if (pathname === '/operation' || !isAuthenticated) {
    return <>{children}</>;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/operation/dashboard' },
    { icon: Database, label: 'Distributions', href: '/operation/distributions' },
    { icon: Coins, label: 'Économie', href: '/operation/economy' },
    { icon: ShoppingBag, label: 'Boutique', href: '/operation/shop-config' },
    { icon: Settings, label: 'Paramètres', href: '/operation/settings' },
    { icon: Users, label: 'Membres', href: '/operation/members' },
    { icon: Bot, label: 'Bots', href: '/operation/bots' },
    { icon: BookOpen, label: 'Règles', href: '/operation/rules' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold">Administration</h1>
        </div>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-slate-800"
            >
              <Home className="mr-2 h-4 w-4" />
              Voir le site
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h2 className="ml-4 text-lg font-semibold text-slate-900">
            {menuItems.find(item => item.href === pathname)?.label || 'Administration'}
          </h2>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
