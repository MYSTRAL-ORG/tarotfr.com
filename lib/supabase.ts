import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && typeof window !== 'undefined') {
  console.warn('Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
