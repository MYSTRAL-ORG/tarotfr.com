import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateNewDistribution } from '@/lib/distributionSeeder';

export async function POST(request: NextRequest) {
  try {

    // Generate a new distribution automatically for this table
    const distribution = generateNewDistribution();

    // Convert BigInt to string for JSON serialization
    const distributionNumberStr = distribution.metadata.distributionNumber.toString();
    const sequenceNumberStr = distribution.metadata.sequenceNumber.toString();

    // Insert the distribution
    const { data: distributionData, error: distError } = await supabase
      .from('card_distributions')
      .insert({
        distribution_number: distributionNumberStr,
        sequence_number: sequenceNumberStr,
        hash_code: distribution.metadata.hashCode,
        deck_order: JSON.parse(JSON.stringify(distribution.metadata.deckOrder)),
        used_count: 0,
      })
      .select()
      .single();

    if (distError || !distributionData) {
      console.error('Failed to create distribution:', distError);
      console.error('Error details:', JSON.stringify(distError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create distribution for table', details: distError?.message },
        { status: 500 }
      );
    }

    // Create the table with the distribution
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .insert({
        status: 'WAITING',
        max_players: 4,
        distribution_id: distributionData.id,
      })
      .select()
      .single();

    if (tableError || !table) {
      console.error('Failed to create table:', tableError);
      console.error('Error details:', JSON.stringify(tableError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create table', details: tableError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      table: {
        ...table,
        distribution: {
          hashCode: distributionData.hash_code,
          distributionNumber: distributionData.distribution_number,
          sequenceNumber: distributionData.sequence_number,
        }
      }
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
