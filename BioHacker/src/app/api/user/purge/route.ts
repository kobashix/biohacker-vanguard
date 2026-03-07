import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Route for purging all user data
export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co';
  
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe',
    { cookies: { get(name: string) { return request.cookies.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminDb = serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

  const errors: string[] = [];

  // Step 1: Delete child records first (FK order matters)
  const step1 = await Promise.all([
    adminDb.from('dose_logs').delete().eq('user_id', user.id),
    adminDb.from('subjective_logs').delete().eq('user_id', user.id),
    adminDb.from('supplies').delete().eq('user_id', user.id),
    adminDb.from('cycles').delete().eq('user_id', user.id),
  ]);
  step1.forEach((r, i) => {
    if (r.error) errors.push(`step1[${i}]: ${r.error.message}`);
  });

  // Step 2: Delete protocols (FK: protocols -> vials)
  const step2 = await adminDb.from('protocols').delete().eq('user_id', user.id);
  if (step2.error) errors.push(`protocols: ${step2.error.message}`);

  // Step 3: Delete vials (parent record, after all children)
  const step3 = await adminDb.from('vials').delete().eq('user_id', user.id);
  if (step3.error) errors.push(`vials: ${step3.error.message}`);

  // Step 4: Clear Replicache client tracking (no user_id col, use client_group_id)
  const step4 = await adminDb.from('replicache_clients').delete().eq('client_group_id', user.id);

  if (errors.length > 0) {
    console.error('[purge] Errors:', errors);
    return NextResponse.json({ success: false, errors }, { status: 500 });
  }

  console.log(`[purge] All data deleted for user ${user.id}`);
  return NextResponse.json({ success: true });
}
