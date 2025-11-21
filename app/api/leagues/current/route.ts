import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
      .select(`
        *,
        division:league_divisions(
          *,
          league:leagues(*)
        )
      `)
      .eq('user_id', userId)
      .eq('season_id', season.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({
        season,
        membership: null,
        message: 'User not assigned to a league yet'
      });
    }

    return NextResponse.json({
      season,
      membership
    });
  } catch (error) {
    console.error('Error fetching current league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current league' },
      { status: 500 }
    );
  }
}
