import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;

    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .maybeSingle();

    if (tableError || !table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    const { data: players, error: playersError } = await supabase
      .from('table_players')
      .select(`
        *,
        users!table_players_user_id_fkey (
          id,
          display_name,
          is_guest
        )
      `)
      .eq('table_id', tableId)
      .order('seat_index', { ascending: true });

    if (playersError) {
      return NextResponse.json(
        { error: 'Failed to fetch players' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      table,
      players: players || [],
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
