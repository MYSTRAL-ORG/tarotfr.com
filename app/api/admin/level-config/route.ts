import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('level_config')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ levels: data });
  } catch (error) {
    console.error('Error fetching level config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { level, ...updates } = body;

    const { data, error } = await supabase
      .from('level_config')
      .update(updates)
      .eq('level', level)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ levelConfig: data });
  } catch (error) {
    console.error('Error updating level config:', error);
    return NextResponse.json(
      { error: 'Failed to update level config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('level_config')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ levelConfig: data });
  } catch (error) {
    console.error('Error creating level config:', error);
    return NextResponse.json(
      { error: 'Failed to create level config' },
      { status: 500 }
    );
  }
}
