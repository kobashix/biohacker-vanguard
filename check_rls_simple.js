
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgmzvczfnqlvqvrsnnxj.supabase.co';
const anonKey = 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe';

const supabase = createClient(supabaseUrl, anonKey);

async function check() {
  const tables = ['vials', 'dose_logs', 'protocols', 'subjective_logs', 'supplies', 'cycles', 'replicache_clients', 'bio_markers'];
  for (const table of tables) {
    console.log(`Checking ${table}...`);
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${table} error: ${error.message} (${error.code})`);
    } else {
      console.log(`  ${table} success. RLS might be allowing select.`);
    }
  }
}

check();
