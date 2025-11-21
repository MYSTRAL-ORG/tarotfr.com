import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('divisionId');
    const userId = searchParams.get('userId');

    if (!divisionId) {
      return NextResponse.json(
        { error: 'Division ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: division } = await supabase
      .from('league_divisions')
      .select('*, league:leagues(*)')
      .eq('id', divisionId)
      .maybeSingle();

    if (!division) {
      return NextResponse.json(
        { error: 'Division not found' },
        { status: 404 }
      );
    }

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

    const { data: memberships, error } = await supabase
      .from('league_memberships')
      .select(`
        *,
        user:users(id, display_name)
      `)
      .eq('division_id', divisionId)
      .eq('season_id', season.id)
      .order('league_points', { ascending: false })
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const rankings = memberships?.map((m, index) => ({
      rank: index + 1,
      userId: m.user_id,
      displayName: m.user?.display_name || 'Joueur',
      leaguePoints: m.league_points,
      isCurrentUser: userId ? m.user_id === userId : false
    })) || [];

    const { data: rewards } = await supabase
      .from('league_rewards')
      .select('*')
      .eq('league_id', division.league_id)
      .order('rank', { ascending: true });

    return NextResponse.json({
      division,
      season,
      rankings,
      rewards: rewards || []
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
