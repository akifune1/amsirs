'use server';

import { decrypt } from '@/lib/encryption';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getDecryptedDescription(ciphertext: string) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  );

  // Security Check: Ensure the person clicking is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    return decrypt(ciphertext);
  } catch (error) {
    return "Error: Could not decrypt data. Key mismatch.";
  }
}