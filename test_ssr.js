import { createServerClient } from '@supabase/ssr';

try {
  const supabase = createServerClient(
    'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe',
    {
      cookies: {
        get(name) {
          return undefined;
        }
      }
    }
  );

  supabase.auth.getUser().then(() => {
    console.log('getUser succeeded (or at least didn\'t crash synchronously)');
  }).catch(e => {
    console.log('getUser threw an error:', e.message);
  });
} catch (e) {
  console.log('Client initialization threw:', e.message);
}
