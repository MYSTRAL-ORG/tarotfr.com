'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminSection } from '@/components/admin/AdminPageLayout';

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
      const { data: settings, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!settings) {
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({ landing_page_mode: landingPageMode });

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ landing_page_mode: landingPageMode })
          .eq('id', settings.id);

        if (updateError) throw updateError;
      }

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

  return (
    <AdminPageLayout
      title="Paramètres"
      description="Configuration générale du site"
      icon={Settings}
      loading={loading}
    >
      <AdminSection
        title="Page d'accueil"
        description="Configurez le mode d'affichage de la page d'accueil"
        icon={Settings}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="landing-mode" className="text-base">
                Mode Landing Page
              </Label>
              <p className="text-sm text-muted-foreground">
                Afficher une landing page marketing au lieu du jeu directement
              </p>
            </div>
            <Switch
              id="landing-mode"
              checked={landingPageMode}
              onCheckedChange={setLandingPageMode}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </AdminSection>
    </AdminPageLayout>
  );
}
