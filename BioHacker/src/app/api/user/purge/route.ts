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
  if (!serviceKey) {
    console.error('[purge] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  
  const adminDb = serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

  const errors: string[] = [];
  const counts: Record<string, number> = {};

  console.log(`[purge] Starting exhaustive purge for user ${user.id}`);

  // Step 1: Delete deep child records first (FK order matters)
  const tablesToPurge = ['dose_logs', 'subjective_logs', 'supplies', 'cycles', 'bio_markers'];
  
  for (const table of tablesToPurge) {
    const { count, error: deleteError } = await adminDb.from(table).delete({ count: 'exact' }).eq('user_id', user.id);
    if (deleteError) {
      if (deleteError.message.includes('Could not find the table') || deleteError.code === 'PGRST116' || deleteError.code === '42P01') {
        console.warn(`[purge] Table ${table} not found in schema, skipping.`);
      } else {
        errors.push(`${table}: ${deleteError.message}`);
      }
    } else {
      counts[table] = count || 0;
    }
  }

  // Step 2: Delete protocols (FK: protocols -> vials)
  const { count: protocolCount, error: protocolError } = await adminDb.from('protocols').delete({ count: 'exact' }).eq('user_id', user.id);
  if (protocolError) {
    if (!protocolError.message.includes('Could not find the table')) {
      errors.push(`protocols: ${protocolError.message}`);
    }
  } else {
    counts['protocols'] = protocolCount || 0;
  }

  // Step 3: Delete vials (parent record, after all children)
  const { count: vialCount, error: vialError } = await adminDb.from('vials').delete({ count: 'exact' }).eq('user_id', user.id);
  if (vialError) {
    if (!vialError.message.includes('Could not find the table')) {
      errors.push(`vials: ${vialError.message}`);
    }
  } else {
    counts['vials'] = vialCount || 0;
  }

  // Step 4: Clear Replicache client tracking
  const { count: clientCount, error: clientError } = await adminDb.from('replicache_clients').delete({ count: 'exact' }).eq('client_group_id', user.id);
  if (clientError) {
    if (!clientError.message.includes('Could not find the table')) {
      errors.push(`replicache_clients: ${clientError.message}`);
    }
  } else {
    counts['replicache_clients'] = clientCount || 0;
  }

  if (errors.length > 0) {
    console.error('[purge] Errors encountered:', errors);
    return NextResponse.json({ 
      success: false, 
      errors,
      counts,
      message: "Some data could not be cleared due to database constraints."
    }, { status: 500 });
  }

  console.log(`[purge] COMPLETE: All data deleted for user ${user.id}`, counts);
  return NextResponse.json({ success: true, counts });
}
