import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
  'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
);

async function testPurge() {
  const email = `test_purge_${Date.now()}@minmaxmuscle.com`;
  const password = 'Testpassword123!';
  
  console.log('Signing up:', email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Sign up error:', authError.message);
    return;
  }

  const userId = authData.user?.id;
  const session = authData.session;
  
  if (!session) {
    console.error('No session returned. Email confirmation might be required.');
    return;
  }

  console.log('User created:', userId);
  
  console.log('Inserting dummy data...');
  const vialId = crypto.randomUUID();
  await supabase.from('vials').insert({ id: vialId, user_id: userId, name: 'Test Vial', status: 'mixed', volume_ml: 10, remaining_volume_ml: 10, compounds: [] });

  const protocolId = crypto.randomUUID();
  await supabase.from('protocols').insert({ id: protocolId, user_id: userId, vial_id: vialId, dose_amount: 1, frequency_hours: 24, days_on: 7, days_off: 0, start_time: Date.now() });

  console.log('Data inserted. Calling purge API...');

  try {
    const res = await fetch('https://biohacker.minmaxmuscle.com/api/user/purge', {
      method: 'DELETE',
      headers: {
        'Cookie': `sb-mgmzvczfnqlvqvrsnnxj-auth-token=${encodeURIComponent(JSON.stringify(['', session.access_token, session.refresh_token]))}`
      }
    });
    
    const body = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', body);
  } catch(e) {
    console.error('Fetch failed:', e);
  }
}

testPurge();
