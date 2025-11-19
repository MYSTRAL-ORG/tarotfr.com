import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();
    const tableId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: existingPlayers } = await supabaseAdmin
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

    const { data: tablePlayer, error } = await supabaseAdmin
      .from('table_players')
      .insert({
        table_id: tableId,
        user_id: userId,
        seat_index: seatIndex,
        is_ready: false,
      })
      .select()
      .single();

    if (error || !tablePlayer) {
      return NextResponse.json(
        { error: 'Failed to join table' },
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
