
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgmzvczfnqlvqvrsnnxj.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // If RPC fails, try a generic query to pg_catalog via SQL if possible?
    // Or just try to select from information_schema.tables but Supabase might block it.
    console.log("RPC failed, trying information_schema...");
    const { data: data2, error: error2 } = await supabase
      .from('vials')
      .select('table_name')
      .eq('table_schema', 'public')
      .returns(); // This won't work.
    
    // Let's just try to check existence of specific tables one by one.
    const tables = ['vials', 'dose_logs', 'protocols', 'subjective_logs', 'supplies', 'cycles', 'replicache_clients', 'bio_markers'];
    for (const t of tables) {
      const { error: e } = await supabase.from(t).select('*').limit(1);
      console.log(`${t}: ${e ? e.message : 'EXISTS'}`);
    }
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

listTables();
