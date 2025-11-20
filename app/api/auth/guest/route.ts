import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function POST(request: NextRequest) {
  try {
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
      console.error('Failed to create guest user:', userError);
      console.error('Error details:', JSON.stringify(userError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create guest user', details: userError?.message },
        { status: 500 }
      );
    }

    const { error: sessionError } = await supabase
      .from('guest_sessions')
      .insert({
        user_id: user.id,
        nickname: nickname,
      });

    if (sessionError) {
      console.error('Failed to create guest session:', sessionError);
      console.error('Error details:', JSON.stringify(sessionError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create guest session', details: sessionError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isGuest: user.is_guest,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    });
  } catch (error: any) {
    console.error('Error creating guest session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create guest session' },
      { status: 500 }
    );
  }
}
