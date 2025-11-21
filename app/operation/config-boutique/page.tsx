'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

interface ShopItem {
  id: string;
  tokens: number;
  price_eur: number;
  price_vnd: number;
  display_order: number;
  title: string;
  description: string;
  enabled: boolean;
}

export default function ShopConfigPage() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shop-items');

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Shop items error:', res.status, errorText);
        throw new Error(`Failed to fetch shop items: ${res.status}`);
      }

      const data = await res.json();
      setShopItems(data.shopItems || []);
    } catch (error: any) {
      console.error('Error fetching shop items:', error);
      toast.error(`Erreur: ${error.message || 'Erreur de chargement'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateShopItem = async (item: ShopItem) => {
    if (updating) return;
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/shop-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Article mis à jour');
    } catch (error) {
      console.error('Error updating shop item:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Configuration Boutique"
        description="Gérer les packs de jetons disponibles à l'achat"
        icon={ShoppingBag}
      >
        <div className="text-center py-12 text-muted-foreground">
          <p>Chargement...</p>
        </div>
      </AdminPageLayout>
    );
  }

  const totalItems = shopItems.length;
  const enabledItems = shopItems.filter(i => i.enabled).length;

  return (
    <AdminPageLayout
      title="Configuration Boutique"
      description="Gérer les packs de jetons disponibles à l'achat"
      icon={ShoppingBag}
      stats={[
        {
          label: 'Packs Disponibles',
          value: totalItems,
          icon: Package,
        },
        {
          label: 'Packs Actifs',
          value: enabledItems,
          icon: Package,
          color: 'text-green-600'
        }
      ]}
    >
      <div className="grid gap-4">
        {shopItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.tokens.toLocaleString()} jetons</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(checked) => {
                    const updated = { ...item, enabled: checked };
                    setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                    updateShopItem(updated);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const updated = { ...item, title: e.target.value };
                        setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                      }}
                      onBlur={() => updateShopItem(item)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => {
                        const updated = { ...item, description: e.target.value };
                        setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                      }}
                      onBlur={() => updateShopItem(item)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de Jetons</Label>
                    <Input
                      type="number"
                      value={item.tokens}
                      onChange={(e) => {
                        const updated = { ...item, tokens: parseInt(e.target.value) || 0 };
                        setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                      }}
                      onBlur={() => updateShopItem(item)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prix (EUR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price_eur}
                        onChange={(e) => {
                          const updated = { ...item, price_eur: parseFloat(e.target.value) || 0 };
                          setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                        }}
                        onBlur={() => updateShopItem(item)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Prix (VND)</Label>
                      <Input
                        type="number"
                        value={item.price_vnd}
                        onChange={(e) => {
                          const updated = { ...item, price_vnd: parseInt(e.target.value) || 0 };
                          setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                        }}
                        onBlur={() => updateShopItem(item)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={item.display_order}
                      onChange={(e) => {
                        const updated = { ...item, display_order: parseInt(e.target.value) || 0 };
                        setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                      }}
                      onBlur={() => updateShopItem(item)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPageLayout>
  );
}
