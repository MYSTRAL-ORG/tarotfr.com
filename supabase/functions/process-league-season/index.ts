import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LeagueMembershipResult {
  id: string;
  user_id: string;
  division_id: string;
  league_points: number;
  rank: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: activeSeason } = await supabase
      .from('league_seasons')
      .select('*')
      .eq('status', 'active')
      .order('season_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!activeSeason) {
      return new Response(
        JSON.stringify({ error: 'No active season found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();
    const endDate = new Date(activeSeason.end_date);

    if (now < endDate) {
      return new Response(
        JSON.stringify({
          message: 'Season not yet finished',
          endDate: activeSeason.end_date
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('league_seasons')
      .update({ status: 'processing' })
      .eq('id', activeSeason.id);

    const { data: divisions } = await supabase
      .from('league_divisions')
      .select('*, league:leagues(*)')
      .order('league_id', { ascending: true })
      .order('division_number', { ascending: true });

    if (!divisions || divisions.length === 0) {
      throw new Error('No divisions found');
    }

    const promotions: Array<{userId: string; fromLeague: number; toLeague: number}> = [];
    const relegations: Array<{userId: string; fromLeague: number; toLeague: number}> = [];
    const maintained: Array<{userId: string; league: number}> = [];

    for (const division of divisions) {
      const { data: memberships } = await supabase
        .from('league_memberships')
        .select('*, user:users(id, display_name)')
        .eq('division_id', division.id)
        .eq('season_id', activeSeason.id)
        .order('league_points', { ascending: false })
        .order('joined_at', { ascending: true });

      if (!memberships || memberships.length === 0) continue;

      for (let i = 0; i < memberships.length; i++) {
        const membership = memberships[i];
        const rank = i + 1;
        let promotionStatus = 'maintained';
        let rewardTokens = 0;

        const { data: reward } = await supabase
          .from('league_rewards')
          .select('reward_tokens')
          .eq('league_id', division.league_id)
          .eq('rank', rank)
          .maybeSingle();

        if (reward) {
          rewardTokens = reward.reward_tokens;

          const { data: wallet } = await supabase
            .from('user_wallets')
            .select('tokens')
            .eq('user_id', membership.user_id)
            .maybeSingle();

          if (wallet) {
            const newTokens = wallet.tokens + rewardTokens;
            await supabase
              .from('user_wallets')
              .update({
                tokens: newTokens,
                total_tokens_earned: newTokens
              })
              .eq('user_id', membership.user_id);

            await supabase
              .from('transactions')
              .insert({
                user_id: membership.user_id,
                type: 'league_reward',
                amount: rewardTokens,
                balance_after: newTokens,
                metadata: {
                  season_id: activeSeason.id,
                  league_id: division.league_id,
                  rank: rank,
                  final_points: membership.league_points
                }
              });
          }
        }

        if (rank <= 10 && division.league_id < 15) {
          promotionStatus = 'promoted';
          promotions.push({
            userId: membership.user_id,
            fromLeague: division.league_id,
            toLeague: division.league_id + 1
          });
        } else if (rank > 20 && division.league_id > 1) {
          promotionStatus = 'relegated';
          relegations.push({
            userId: membership.user_id,
            fromLeague: division.league_id,
            toLeague: division.league_id - 1
          });
        } else {
          maintained.push({
            userId: membership.user_id,
            league: division.league_id
          });
        }

        await supabase
          .from('league_history')
          .insert({
            user_id: membership.user_id,
            season_id: activeSeason.id,
            league_id: division.league_id,
            division_id: division.id,
            final_rank: rank,
            final_points: membership.league_points,
            reward_tokens: rewardTokens,
            promotion_status: promotionStatus
          });
      }
    }

    await supabase
      .from('league_seasons')
      .update({ status: 'completed' })
      .eq('id', activeSeason.id);

    const nextSeasonNumber = activeSeason.season_number + 1;
    const nextStartDate = new Date(endDate);
    const nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextEndDate.getDate() + 7);

    const { data: newSeason } = await supabase
      .from('league_seasons')
      .insert({
        season_number: nextSeasonNumber,
        start_date: nextStartDate.toISOString(),
        end_date: nextEndDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (!newSeason) {
      throw new Error('Failed to create new season');
    }

    await supabase
      .from('league_memberships')
      .delete()
      .eq('season_id', activeSeason.id);

    const leagueGroups: Map<number, string[]> = new Map();

    for (const promo of promotions) {
      const group = leagueGroups.get(promo.toLeague) || [];
      group.push(promo.userId);
      leagueGroups.set(promo.toLeague, group);
    }

    for (const rel of relegations) {
      const group = leagueGroups.get(rel.toLeague) || [];
      group.push(rel.userId);
      leagueGroups.set(rel.toLeague, group);
    }

    for (const maint of maintained) {
      const group = leagueGroups.get(maint.league) || [];
      group.push(maint.userId);
      leagueGroups.set(maint.league, group);
    }

    for (const [leagueId, userIds] of leagueGroups.entries()) {
      const shuffled = userIds.sort(() => Math.random() - 0.5);

      for (let i = 0; i < shuffled.length; i += 30) {
        const chunk = shuffled.slice(i, i + 30);
        const divisionNumber = Math.floor(i / 30) + 1;

        let divisionId: string | null = null;
        const { data: existingDivision } = await supabase
          .from('league_divisions')
          .select('id')
          .eq('league_id', leagueId)
          .eq('division_number', divisionNumber)
          .maybeSingle();

        if (existingDivision) {
          divisionId = existingDivision.id;
        } else {
          const { data: newDivision } = await supabase
            .from('league_divisions')
            .insert({
              league_id: leagueId,
              division_number: divisionNumber
            })
            .select('id')
            .single();

          if (newDivision) {
            divisionId = newDivision.id;
          }
        }

        if (divisionId) {
          const memberships = chunk.map(userId => ({
            user_id: userId,
            division_id: divisionId,
            season_id: newSeason.id,
            league_points: 0
          }));

          await supabase
            .from('league_memberships')
            .insert(memberships);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Season processed successfully',
        stats: {
          promoted: promotions.length,
          relegated: relegations.length,
          maintained: maintained.length,
          newSeasonNumber: nextSeasonNumber
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing league season:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process league season',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});