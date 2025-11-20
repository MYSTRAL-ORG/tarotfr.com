import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hashCode } = body;

    if (!hashCode) {
      return NextResponse.json(
        { error: 'Hash code is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('card_distributions')
      .select('id, hash_code, distribution_number, sequence_number, created_at')
      .eq('hash_code', hashCode)
      .maybeSingle();

    if (error) {
      console.error('Error validating hash code:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to validate hash code', details: error?.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { valid: false, message: 'Hash code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      distribution: {
        id: data.id,
        hashCode: data.hash_code,
        distributionNumber: data.distribution_number,
        sequenceNumber: data.sequence_number,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error('Error in validate distribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
