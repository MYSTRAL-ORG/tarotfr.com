import { NextRequest, NextResponse } from 'next/server';
import { createGuestSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await createGuestSession();
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error creating guest session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create guest session' },
      { status: 500 }
    );
  }
}
