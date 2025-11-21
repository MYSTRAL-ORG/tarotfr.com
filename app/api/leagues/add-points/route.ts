import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, points, gameId } = body;

    if (!userId || points === undefined) {
      return NextResponse.json(
        { error: 'User ID and points are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: season } = await supabase
      .from('league_seasons')
      .select('*')
      .eq('status', 'active')
      .order('season_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!season) {
      return NextResponse.json(
        { error: 'No active season found' },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('league_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('season_id', season.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'User not in any league' },
        { status: 404 }
      );
    }

    const newPoints = membership.league_points + points;

    const { data: updated, error } = await supabase
      .from('league_memberships')
      .update({ league_points: newPoints })
      .eq('id', membership.id)
      .select()
      .single();

    if (error) throw error;

    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('tokens')
      .eq('user_id', userId)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'league_points',
          amount: points,
          balance_after: wallet.tokens,
          game_id: gameId || null,
          metadata: {
            league_points: points,
            new_total: newPoints
          }
        });
    }

    return NextResponse.json({
      success: true,
      membership: updated,
      pointsAdded: points
    });
  } catch (error) {
    console.error('Error adding league points:', error);
    return NextResponse.json(
      { error: 'Failed to add league points' },
      { status: 500 }
    );
  }
}
