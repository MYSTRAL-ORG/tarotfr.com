import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient();
    const { userId } = params;

    const { data: wallet, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!wallet) {
      const { data: newWallet, error: insertError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          tokens: 2000,
          total_tokens_earned: 2000,
          xp: 0,
          level: 1,
          league_points: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({ wallet: newWallet });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
