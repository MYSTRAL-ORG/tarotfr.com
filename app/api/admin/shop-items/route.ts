import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ shopItems: data });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('shop_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ shopItem: data });
  } catch (error) {
    console.error('Error updating shop item:', error);
    return NextResponse.json(
      { error: 'Failed to update shop item' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('shop_items')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ shopItem: data });
  } catch (error) {
    console.error('Error creating shop item:', error);
    return NextResponse.json(
      { error: 'Failed to create shop item' },
      { status: 500 }
    );
  }
}
