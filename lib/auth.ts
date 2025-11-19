import { supabase } from './supabase';
import { User } from './types';

const GUEST_ADJECTIVES = [
  'Rapide', 'Brave', 'Sage', 'Fort', 'Rusé', 'Noble', 'Fier', 'Calme',
  'Vif', 'Loyal', 'Habile', 'Astucieux', 'Chanceux', 'Audacieux'
];

const GUEST_NOUNS = [
  'Joueur', 'Champion', 'Expert', 'Maître', 'Stratège', 'As', 'Magicien',
  'Virtuose', 'Prodige', 'Artiste', 'Génie', 'Héros', 'Légende'
];

function generateGuestNickname(): string {
  const adj = GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}

export async function createGuestSession(): Promise<User> {
  const nickname = generateGuestNickname();

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      display_name: nickname,
      is_guest: true,
      email: null,
    })
    .select()
    .single();

  if (userError || !user) {
    throw new Error('Failed to create guest user');
  }

  const { error: sessionError } = await supabase
    .from('guest_sessions')
    .insert({
      user_id: user.id,
      nickname: nickname,
    });

  if (sessionError) {
    throw new Error('Failed to create guest session');
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isGuest: user.is_guest,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function registerUser(email: string, password: string, displayName: string): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      }
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to register user');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: email,
      display_name: displayName,
      is_guest: false,
    })
    .select()
    .single();

  if (userError || !user) {
    throw new Error('Failed to create user profile');
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isGuest: user.is_guest,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function loginUser(email: string, password: string): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to login');
  }

  let { data: user, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', authData.user.id)
    .maybeSingle();

  if (!user && !userError) {
    const displayName = authData.user.user_metadata?.display_name ||
                        authData.user.email?.split('@')[0] ||
                        'Utilisateur';

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        display_name: displayName,
        is_guest: false,
      })
      .select()
      .single();

    if (createError || !newUser) {
      throw new Error('Failed to create user profile');
    }

    user = newUser;
  }

  if (userError || !user) {
    throw new Error('Failed to fetch user profile');
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isGuest: user.is_guest,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  let { data: user, error } = await supabase
    .from('users')
    .select()
    .eq('id', session.user.id)
    .maybeSingle();

  if (!user && !error) {
    const displayName = session.user.user_metadata?.display_name ||
                        session.user.email?.split('@')[0] ||
                        'Utilisateur';

    const { data: newUser } = await supabase
      .from('users')
      .insert({
        id: session.user.id,
        email: session.user.email,
        display_name: displayName,
        is_guest: false,
      })
      .select()
      .single();

    if (newUser) {
      user = newUser;
    }
  }

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isGuest: user.is_guest,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
