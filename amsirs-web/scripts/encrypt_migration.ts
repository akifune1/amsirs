import { createClient } from '@supabase/supabase-js';
import { encrypt } from '../lib/encryption';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isEncrypted(text: string | null | undefined): boolean {
  if (!text) return false;
  // Our encryption format is ivHex:authTagHex:encryptedText
  return text.split(':').length === 3;
}

async function migrateStudents() {
  console.log("Fetching students...");
  const { data: students, error } = await supabase.from('students').select('id, address, birthday');
  
  if (error) {
    console.error("Error fetching students:", error);
    return;
  }

  console.log(`Found ${students.length} students. Checking for plaintext PII...`);
  let updatedCount = 0;

  for (const student of students) {
    let needsUpdate = false;
    const updates: any = {};

    if (student.address && !isEncrypted(student.address)) {
      updates.address = encrypt(student.address);
      needsUpdate = true;
    }

    if (student.birthday && !isEncrypted(student.birthday)) {
      updates.birthday = encrypt(student.birthday);
      needsUpdate = true;
    }

    if (needsUpdate) {
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

  console.log(`✅ Successfully encrypted PII for ${updatedCount} students.`);
}

async function migrateInterventions() {
  console.log("Fetching support interventions...");
  const { data: interventions, error } = await supabase.from('support_interventions').select('id, notes');
  
  if (error) {
    console.error("Error fetching interventions:", error);
    return;
  }

  console.log(`Found ${interventions.length} interventions. Checking for plaintext notes...`);
  let updatedCount = 0;

  for (const intervention of interventions) {
    if (intervention.notes && !isEncrypted(intervention.notes)) {
      const { error: updateError } = await supabase
        .from('support_interventions')
        .update({ notes: encrypt(intervention.notes) })
        .eq('id', intervention.id);
        
      if (updateError) {
        console.error(`Failed to update intervention ${intervention.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✅ Successfully encrypted notes for ${updatedCount} interventions.`);
}

async function run() {
  console.log("🚀 Starting Data Encryption Migration...");
  await migrateStudents();
  await migrateInterventions();
  console.log("🎉 Migration Complete!");
}

run();
