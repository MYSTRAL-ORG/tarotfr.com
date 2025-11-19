import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNewDistribution } from '@/lib/distributionSeeder';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This distribution already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating distribution:', error);
      return NextResponse.json(
        { error: 'Failed to create distribution' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      distributionNumber: data.distribution_number,
      sequenceNumber: data.sequence_number,
      hashCode: data.hash_code,
      hands: distribution.hands,
      dog: distribution.dog,
    });
  } catch (error) {
    console.error('Error in generate distribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
