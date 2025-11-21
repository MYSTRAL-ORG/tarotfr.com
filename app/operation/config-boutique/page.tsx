'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

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
        throw new Error('Failed to fetch shop items');
      }

      const data = await res.json();
      setShopItems(data.shopItems || []);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      toast.error('Erreur lors du chargement des articles');
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
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Boutique</h1>
          <p className="text-muted-foreground">
            Gérer les packs de jetons disponibles à l'achat
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Pack
        </Button>
      </div>

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
                    <Label>Titre du Pack</Label>
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
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prix (EUR)</Label>
                    <div className="relative">
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
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix (VND)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={item.price_vnd}
                        onChange={(e) => {
                          const updated = { ...item, price_vnd: parseFloat(e.target.value) || 0 };
                          setShopItems(items => items.map(i => i.id === item.id ? updated : i));
                        }}
                        onBlur={() => updateShopItem(item)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₫
                      </span>
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

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ID: {item.id}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateShopItem(item)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
