import { createClient } from '@supabase/supabase-js';

// We use NEXT_PUBLIC_ so the client-side can also access these if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// A quick security check: If these are missing, the app will crash early with a clear error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('CRITICAL: Missing Supabase Environment Variables in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);