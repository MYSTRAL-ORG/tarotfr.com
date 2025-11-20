import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dealCardsWithSeed, sortHand } from '@/lib/distributionSeeder';

export async function GET(
  request: NextRequest,
  { params }: { params: { hashCode: string } }
) {
  try {
    const { hashCode } = params;

    const { data: distribution, error: distError } = await supabase
      .from('card_distributions')
      .select('*')
      .eq('hash_code', hashCode)
      .maybeSingle();

    if (distError) {
      console.error('Error fetching distribution:', distError);
      console.error('Error details:', JSON.stringify(distError, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch distribution', details: distError?.message },
        { status: 500 }
      );
    }

    if (!distribution) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 }
      );
    }

    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, status, created_at')
      .eq('distribution_id', distribution.id);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      console.error('Error details:', JSON.stringify(gamesError, null, 2));
    }

    const hasCompletedGame = games?.some(g => g.status === 'END' || g.status === 'SCORING');

    const distributionNum = BigInt(distribution.distribution_number);
    const sequenceNum = BigInt(distribution.sequence_number);
    const seededDist = dealCardsWithSeed(distributionNum, sequenceNum);

    const sortedHands: Record<number, any> = {};
    for (let i = 0; i < 4; i++) {
      sortedHands[i] = sortHand(seededDist.hands[i]);
    }

    return NextResponse.json({
      id: distribution.id,
      distributionNumber: distribution.distribution_number,
      sequenceNumber: distribution.sequence_number,
      hashCode: distribution.hash_code,
      usedCount: distribution.used_count,
      createdAt: distribution.created_at,
      hands: hasCompletedGame ? sortedHands : null,
      dog: hasCompletedGame ? seededDist.dog : null,
      canViewDetails: hasCompletedGame,
      gamesPlayed: games?.length || 0,
    });
  } catch (error) {
    console.error('Error in get distribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
