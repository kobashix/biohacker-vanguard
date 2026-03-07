import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
  'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
);

async function checkDeletes() {
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const { error } = await supabase.from('replicache_clients').delete().eq('client_group_id', dummyId);
  console.log(`Delete replicache_clients:`, error ? error.message : 'Success');
}

checkDeletes();
