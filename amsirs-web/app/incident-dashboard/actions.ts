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

// ... existing imports and getDecryptedDescription function ...

export async function getSecureImageUrl(imagePath: string | null) {
  if (!imagePath) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Security check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Generate a URL that expires in 60 minutes
  const { data, error } = await supabase.storage
    .from('incident_attachments')
    .createSignedUrl(imagePath, 3600);
    
  if (error) {
    console.error("Error fetching image:", error);
    return null;
  }
  
  return data.signedUrl;
}