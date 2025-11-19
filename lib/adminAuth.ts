import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

export async function getAdminRole(userId: string): Promise<'admin' | 'moderator' | null> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as 'admin' | 'moderator';
}

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, any>
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: adminData } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', adminUserId)
    .maybeSingle();

  if (!adminData) {
    return;
  }

  await supabase.from('admin_logs').insert({
    admin_user_id: adminData.id,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
}
