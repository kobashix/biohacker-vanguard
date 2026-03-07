import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe',
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const pullRequest = await request.json();
  const { clientGroupID, clientID } = pullRequest;

  if (clientGroupID !== user.id) return new Response('Forbidden', { status: 403 });

  // Supabase is the source of truth — always do a full pull of all user data
  const [vialsRes, logsRes, protocolsRes, subjectiveRes, suppliesRes, cyclesRes] = await Promise.all([
    supabase.from('vials').select('*').eq('user_id', user.id),
    supabase.from('dose_logs').select('*').eq('user_id', user.id),
    supabase.from('protocols').select('*').eq('user_id', user.id),
    supabase.from('subjective_logs').select('*').eq('user_id', user.id),
    supabase.from('supplies').select('*').eq('user_id', user.id),
    supabase.from('cycles').select('*').eq('user_id', user.id),
  ]);

  // Always clear Replicache's local store then reload from Supabase.
  // This guarantees Supabase is canonical and no stale local mutations persist.
  const patch: object[] = [{ op: 'clear' }];

  vialsRes.data?.forEach(v => patch.push({ op: 'put', key: `vial/${v.id}`, value: v }));
  logsRes.data?.forEach(l => patch.push({ op: 'put', key: `log/${l.id}`, value: l }));
  protocolsRes.data?.forEach(p => patch.push({ op: 'put', key: `protocol/${p.id}`, value: p }));
  subjectiveRes.data?.forEach(s => patch.push({ op: 'put', key: `subjective/${s.id}`, value: s }));
  suppliesRes.data?.forEach(sup => patch.push({ op: 'put', key: `supply/${sup.id}`, value: sup }));
  cyclesRes.data?.forEach(c => patch.push({ op: 'put', key: `cycle/${c.id}`, value: c }));

  // lastMutationIDChanges tells Replicache which local pending mutations have been
  // processed server-side. By returning the clientID's current push mutation ID,
  // we prevent Replicache from re-applying any pending mutations on top of the clean pull.
  const { data: clientRow } = await supabase
    .from('replicache_clients')
    .select('last_mutation_id')
    .eq('id', clientID)
    .single();

  const lastMutationID = clientRow?.last_mutation_id ?? 0;

  return NextResponse.json({
    cookie: Date.now(),
    lastMutationIDChanges: clientID ? { [clientID]: lastMutationID } : {},
    patch,
  });
}
