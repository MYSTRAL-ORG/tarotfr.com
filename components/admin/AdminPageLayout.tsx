import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AdminPageLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    description?: string;
  }[];
  children: ReactNode;
  loading?: boolean;
}

export function AdminPageLayout({
  title,
  description,
  icon: Icon,
  actions,
  stats,
  children,
  loading = false
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color ? `bg-${stat.color.replace('text-', '')}/10` : 'bg-muted'}`}>
                    <StatIcon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  );
}

interface AdminSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = ''
}: AdminSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-muted rounded-lg">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription className="mt-1.5">{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
