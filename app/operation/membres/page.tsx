'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar, UserCheck, UserX, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { AdminPageLayout, AdminSection } from '@/components/admin/AdminPageLayout';

interface Member {
  id: string;
  email: string | null;
  display_name: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    guests: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMembers(data || []);

      const registered = data?.filter(m => !m.is_guest).length || 0;
      const guests = data?.filter(m => m.is_guest).length || 0;

      setStats({
        total: data?.length || 0,
        registered,
        guests,
      });
    } catch (error: any) {
      toast.error('Erreur lors du chargement des membres');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Membre supprimé avec succès');
      fetchMembers();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression du membre');
      console.error('Error deleting member:', error);
    }
  }

  const filteredMembers = members.filter(member =>
    member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminPageLayout
      title="Gestion des membres"
      description="Gérez les utilisateurs de votre application"
      icon={Users}
      stats={[
        {
          label: 'Membres enregistrés',
          value: stats.registered,
          icon: UserCheck,
          color: 'text-green-600'
        },
        {
          label: 'Invités',
          value: stats.guests,
          icon: UserX,
          color: 'text-blue-600'
        },
        {
          label: 'Total',
          value: stats.total,
          icon: Users
        }
      ]}
    >
      <AdminSection
        title="Liste des membres"
        description="Tous les utilisateurs enregistrés et invités"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucun membre trouvé</p>
              <p className="text-sm mt-2">Les nouveaux membres apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      {member.is_guest ? (
                        <UserX className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <UserCheck className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{member.display_name}</h3>
                        {member.is_guest ? (
                          <Badge variant="outline" className="text-xs">Invité</Badge>
                        ) : (
                          <Badge className="text-xs bg-green-600">Membre</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Inscrit le {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminSection>
    </AdminPageLayout>
  );
}
