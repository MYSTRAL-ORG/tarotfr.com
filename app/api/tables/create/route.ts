import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        status: 'WAITING',
        max_players: 4,
      })
      .select()
      .single();

    if (error || !table) {
      return NextResponse.json(
        { error: 'Failed to create table' },
        { status: 500 }
      );
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
