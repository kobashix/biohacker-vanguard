import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
  'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
);

async function checkDeletes() {
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const tables = ['dose_logs', 'subjective_logs', 'supplies', 'cycles', 'protocols', 'vials'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).delete().eq('user_id', dummyId);
    console.log(`Delete ${table}:`, error ? error.message : 'Success');
  }
}

checkDeletes();
