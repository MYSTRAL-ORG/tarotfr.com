'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [landingPageMode, setLandingPageMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('landing_page_mode')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLandingPageMode(data.landing_page_mode);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ landing_page_mode: landingPageMode })
        .eq('id', (await supabase.from('site_settings').select('id').limit(1).single()).data?.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Paramètres enregistrés avec succès',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600 mt-2">Configurez votre application</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apparence du site</CardTitle>
          <CardDescription>
            Contrôlez l'affichage du site pour les visiteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="landing-mode" className="text-base">
                Mode Landing Page
              </Label>
              <p className="text-sm text-slate-500">
                Active une page d'accueil minimaliste avec seulement le logo et le footer
              </p>
            </div>
            <Switch
              id="landing-mode"
              checked={landingPageMode}
              onCheckedChange={setLandingPageMode}
            />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Mode Landing Page :</strong> Lorsqu'il est activé, le site affiche uniquement
              une page d'accueil simplifiée avec le logo du site. Idéal pour mettre le site en maintenance
              ou avant le lancement officiel.
            </p>
            <p>
              <strong>Mode Normal :</strong> Le site affiche l'interface complète avec toutes les fonctionnalités.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
