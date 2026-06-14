'use server';

import { createClient } from '@supabase/supabase-js';

export async function getMissingEmbeddings() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing service role key");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all students
  const { data: students, error: studentError } = await supabaseAdmin
    .from('students')
    .select('id, face_photo_path, first_name, last_name')
    .not('face_photo_path', 'is', null);

  if (studentError) throw studentError;

  // Get all existing embeddings
  const { data: embeddings, error: embedError } = await supabaseAdmin
    .from('face_embeddings')
    .select('student_id');

  if (embedError) throw embedError;

  const existingIds = new Set(embeddings.map((e: any) => e.student_id));

  // Filter students who are missing embeddings
  const missing = students.filter((s: any) => !existingIds.has(s.id));

  return missing;
}
