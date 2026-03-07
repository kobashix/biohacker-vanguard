import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
  'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
);

async function checkTables() {
  const tables = ['dose_logs', 'subjective_logs', 'supplies', 'cycles', 'protocols', 'vials', 'replicache_clients'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table: ${table}`);
    if (error) {
      console.log(`  Error: ${error.message}`);
    } else {
      console.log(`  Success. Rows: ${data?.length}`);
    }
  }
}

checkTables();
