import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, buyIn } = await request.json();
    const tableId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (buyIn && buyIn > 0) {
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('tokens, total_tokens_spent')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wallet || wallet.tokens < buyIn) {
        return NextResponse.json(
          { error: 'Jetons insuffisants', insufficientTokens: true },
          { status: 400 }
        );
      }

      const newBalance = wallet.tokens - buyIn;
      const newTotalSpent = (wallet.total_tokens_spent || 0) + buyIn;

      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          tokens: newBalance,
          total_tokens_spent: newTotalSpent
        })
        .eq('user_id', userId);

      if (walletError) {
        console.error('[JOIN API] Failed to deduct tokens:', walletError);
        return NextResponse.json(
          { error: 'Erreur lors de la déduction des jetons' },
          { status: 500 }
        );
      }

      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'buy_in',
          amount: -buyIn,
          balance_after: newBalance,
          game_id: tableId,
          metadata: { table_id: tableId }
        });

      }

    const { data: existingPlayers } = await supabase
      .from('table_players')
      .select('*')
      .eq('table_id', tableId);

    if (existingPlayers && existingPlayers.length >= 4) {
      return NextResponse.json(
        { error: 'Table is full' },
        { status: 400 }
      );
    }

    const existingPlayer = existingPlayers?.find(p => p.user_id === userId);
    if (existingPlayer) {
      return NextResponse.json({ success: true, alreadyJoined: true });
    }

    const seatIndex = existingPlayers?.length || 0;

    const { data: tablePlayer, error } = await supabase
      .from('table_players')
      .insert({
        table_id: tableId,
        user_id: userId,
        seat_index: seatIndex,
        is_ready: false,
        buy_in_paid: buyIn && buyIn > 0,
      })
      .select()
      .single();

    if (error || !tablePlayer) {
      console.error('Failed to join table:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to join table', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tablePlayer });
  } catch (error) {
    console.error('Error joining table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
