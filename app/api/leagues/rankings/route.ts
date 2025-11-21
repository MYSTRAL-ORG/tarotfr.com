import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('divisionId');
    const leagueId = searchParams.get('leagueId');
    const divisionNumber = searchParams.get('divisionNumber');
    const userId = searchParams.get('userId');

    const supabase = createClient();

    let division;

    // Support both divisionId and leagueId+divisionNumber
    if (divisionId) {
      const { data } = await supabase
        .from('league_divisions')
        .select('*, league:leagues(*)')
        .eq('id', divisionId)
        .maybeSingle();
      division = data;
    } else if (leagueId && divisionNumber) {
      const { data } = await supabase
        .from('league_divisions')
        .select('*, league:leagues(*)')
        .eq('league_id', parseInt(leagueId))
        .eq('division_number', parseInt(divisionNumber))
        .maybeSingle();
      division = data;
    } else {
      return NextResponse.json(
        { error: 'Either divisionId or leagueId+divisionNumber is required' },
        { status: 400 }
      );
    }

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
      .eq('division_id', division.id)
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
