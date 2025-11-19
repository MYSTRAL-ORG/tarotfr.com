'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { LayoutDashboard, Database, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/distributions', label: 'Distributions', icon: Database },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-600">Gestion du système de distributions</p>
        </div>

        <div className="flex gap-6">
          <aside className="w-64 shrink-0">
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
