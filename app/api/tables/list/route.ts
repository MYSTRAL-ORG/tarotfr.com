import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('*')
      .in('status', ['WAITING', 'IN_GAME'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (tablesError) {
      console.error('Failed to fetch tables:', tablesError);
      console.error('Error details:', JSON.stringify(tablesError, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch tables', details: tablesError?.message },
        { status: 500 }
      );
    }

    const tablesWithPlayers = await Promise.all(
      (tables || []).map(async (table) => {
        const { data: players, error: playersError } = await supabase
          .from('table_players')
          .select('*')
          .eq('table_id', table.id);

        return {
          ...table,
          playerCount: playersError ? 0 : players?.length || 0,
        };
      })
    );

    return NextResponse.json({ tables: tablesWithPlayers });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
