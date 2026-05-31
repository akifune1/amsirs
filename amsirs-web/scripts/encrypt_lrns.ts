import { createClient } from '@supabase/supabase-js';
import { encrypt, hashString } from '../lib/encryption';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isEncrypted(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.split(':').length === 3;
}

async function migrateLRNs() {
  console.log("Fetching students to encrypt LRNs...");
  
  // Note: At this point, the user should have renamed `student_id` to `lrn`
  const { data: students, error } = await supabase.from('students').select('id, lrn');
  
  if (error) {
    console.error("Error fetching students:", error);
    return;
  }

  console.log(`Found ${students.length} students. Checking for plaintext LRNs...`);
  let updatedCount = 0;

  for (const student of students) {
    if (student.lrn && !isEncrypted(student.lrn)) {
      const updates = {
        lrn: encrypt(student.lrn),
        lrn_hash: hashString(student.lrn)
      };

      const { error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', student.id);
        
      if (updateError) {
        console.error(`Failed to update student ${student.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✅ Successfully encrypted LRN and created blind index for ${updatedCount} students.`);
}

async function run() {
  console.log("🚀 Starting LRN Encryption Migration...");
  await migrateLRNs();
  console.log("🎉 Migration Complete!");
}

run();
