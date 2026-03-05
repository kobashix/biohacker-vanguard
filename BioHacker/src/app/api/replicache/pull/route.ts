import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const pullRequest = await request.json();
  const { clientGroupID, cookie } = pullRequest;

  if (clientGroupID !== user.id) return new Response('Forbidden', { status: 403 });

  const [{ data: vials }, { data: logs }, { data: protocols }] = await Promise.all([
    supabase.from('vials').select('*').eq('user_id', user.id),
    supabase.from('dose_logs').select('*').eq('user_id', user.id),
    supabase.from('protocols').select('*').eq('user_id', user.id),
  ]);

  const patch = [];
  if (!cookie) patch.push({ op: 'clear' });

  vials?.forEach(v => patch.push({ op: 'put', key: `vial/${v.id}`, value: v }));
  logs?.forEach(l => patch.push({ op: 'put', key: `log/${l.id}`, value: l }));
  protocols?.forEach(p => patch.push({ op: 'put', key: `protocol/${p.id}`, value: p }));

  return NextResponse.json({ cookie: Date.now(), lastMutationID: 0, patch });
}
