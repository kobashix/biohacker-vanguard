import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function DELETE(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe',
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Delete all user data from every table (RLS ensures only their own rows are deleted)
  await Promise.all([
    supabase.from('dose_logs').delete().eq('user_id', user.id),
    supabase.from('subjective_logs').delete().eq('user_id', user.id),
    supabase.from('supplies').delete().eq('user_id', user.id),
    supabase.from('cycles').delete().eq('user_id', user.id),
    supabase.from('replicache_clients').delete().eq('client_group_id', user.id),
  ]);

  // Protocols and vials have FK constraints (dose_logs -> vials), so delete after logs
  await Promise.all([
    supabase.from('protocols').delete().eq('user_id', user.id),
  ]);
  await supabase.from('vials').delete().eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
