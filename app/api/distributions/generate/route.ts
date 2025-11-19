import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNewDistribution } from '@/lib/distributionSeeder';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = body.count || 1;

    if (count < 1 || count > 10000) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 10000' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const distributions = [];
    let generated = 0;
    let duplicates = 0;

    for (let i = 0; i < count; i++) {
      const distribution = generateNewDistribution();

      const { data, error } = await supabase
        .from('card_distributions')
        .insert({
          distribution_number: distribution.metadata.distributionNumber.toString(),
          sequence_number: distribution.metadata.sequenceNumber.toString(),
          hash_code: distribution.metadata.hashCode,
          deck_order: distribution.metadata.deckOrder,
          used_count: 0,
        })
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          duplicates++;
          continue;
        }
        console.error('Error creating distribution:', error);
        continue;
      }

      if (data) {
        generated++;
        distributions.push({
          id: data.id,
          distributionNumber: data.distribution_number,
          sequenceNumber: data.sequence_number,
          hashCode: data.hash_code,
        });
      }
    }

    return NextResponse.json({
      generated,
      duplicates,
      requested: count,
      distributions: distributions.slice(0, 10),
    });
  } catch (error) {
    console.error('Error in generate distribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
