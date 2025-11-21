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

    const { data: history, error } = await supabase
      .from('league_history')
      .select(`
        *,
        league:leagues(*),
        season:league_seasons(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      history: history || []
    });
  } catch (error) {
    console.error('Error fetching league history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league history' },
      { status: 500 }
    );
  }
}
