import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PlayerResult {
  userId: string;
  position: number;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const { tableId, results } = await request.json() as {
      tableId: string;
      results: PlayerResult[];
    };

    const { data: table } = await supabase
      .from('tables')
      .select('room_type_id, buy_in')
      .eq('id', tableId)
      .maybeSingle();

    if (!table || !table.room_type_id) {
      return NextResponse.json({ error: 'Table or room type not found' }, { status: 404 });
    }

    const { data: roomType } = await supabase
      .from('room_types')
      .select('*')
      .eq('id', table.room_type_id)
      .maybeSingle();

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
    }

    const rewards: Record<string, { tokens: number; xp: number; leaguePoints: number; position: number }> = {};

    for (const result of results) {
      let tokenReward = 0;

      if (result.position === 1) {
        tokenReward = roomType.reward_first;
      } else if (result.position === 2) {
        tokenReward = roomType.reward_second;
      } else if (result.position === 3) {
        tokenReward = roomType.reward_draw;
      } else if (result.position === 4) {
        tokenReward = -table.buy_in;
      }

      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('tokens, xp, level, league_points')
        .eq('user_id', result.userId)
        .maybeSingle();

      if (wallet) {
        const newTokens = wallet.tokens + tokenReward;
        const newXP = wallet.xp + roomType.xp_reward;
        const newLeaguePoints = wallet.league_points + roomType.league_points;

        let newLevel = wallet.level;
        const { data: levelConfigs } = await supabase
          .from('level_config')
          .select('level, xp_required')
          .order('level', { ascending: true });

        if (levelConfigs) {
          for (const config of levelConfigs) {
            if (newXP >= config.xp_required && config.level > newLevel) {
              newLevel = config.level;
            }
          }
        }

        const updateData: any = {
          tokens: newTokens,
          xp: newXP,
          level: newLevel,
          league_points: newLeaguePoints,
        };

        if (tokenReward > 0) {
          updateData.total_tokens_earned = wallet.tokens + tokenReward;
        }

        await supabase
          .from('user_wallets')
          .update(updateData)
          .eq('user_id', result.userId);

        await supabase
          .from('transactions')
          .insert({
            user_id: result.userId,
            type: result.position === 1 ? 'game_win' : 'game_loss',
            amount: tokenReward,
            balance_after: newTokens,
            game_id: tableId,
            metadata: {
              position: result.position,
              score: result.score,
              xp_gained: roomType.xp_reward,
              league_points_gained: roomType.league_points,
            },
          });

        rewards[result.userId] = {
          tokens: tokenReward,
          xp: roomType.xp_reward,
          leaguePoints: roomType.league_points,
          position: result.position,
        };
      }
    }

    await supabase
      .from('tables')
      .update({ status: 'FINISHED' })
      .eq('id', tableId);

    return NextResponse.json({ success: true, rewards });
  } catch (error) {
    console.error('Error processing game end:', error);
    return NextResponse.json(
      { error: 'Failed to process game end' },
      { status: 500 }
    );
  }
}
