import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const pushRequest = await request.json();
  const { clientGroupID, mutations } = pushRequest;

  // Tenant Verification
  if (clientGroupID !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  for (const mutation of mutations) {
    const { name, args } = mutation;

    // Last-Write-Wins (LWW) Conflict Resolution via DB Overwrite
    if (name === 'createVial') {
      await supabase.from('vials').insert({
        id: args.id,
        user_id: session.user.id,
        encrypted_payload: JSON.stringify(args),
        remaining_volume_ml: args.remaining_volume_ml || 0,
      });
    }

    if (name === 'updateVial') {
      await supabase.from('vials').update({
        encrypted_payload: JSON.stringify(args),
        remaining_volume_ml: args.remaining_volume_ml || 0
      }).eq('id', args.id).eq('user_id', session.user.id);
    }

    if (name === 'deleteVial') {
      await supabase.from('vials').delete().eq('id', args).eq('user_id', session.user.id);
    }

    if (name === 'logDose') {
      // 1. Record the log
      await supabase.from('dose_logs').insert({
        id: args.id,
        user_id: session.user.id,
        vial_id: args.vial_id,
        encrypted_payload: JSON.stringify(args),
        dosage_iu: args.units_iu || args.dose_mcg, // units_iu for liquid, dose_mcg for pills
      });

      // 2. Decrement vial volume/pill count in DB
      const { data: vial } = await supabase.from('vials').select('encrypted_payload').eq('id', args.vial_id).single();
      if (vial) {
        const payload = JSON.parse(vial.encrypted_payload);
        if (payload.status === 'pill') {
          payload.pill_count = Math.max(0, (payload.pill_count || 0) - args.dose_mcg);
        } else {
          payload.remaining_volume_ml = Math.max(0, (payload.remaining_volume_ml || 0) - (args.units_iu / 100) - 0.05);
        }
        await supabase.from('vials').update({ 
          encrypted_payload: JSON.stringify(payload),
          remaining_volume_ml: payload.remaining_volume_ml || 0 
        }).eq('id', args.vial_id);
      }
    }
  }

  return NextResponse.json({});
}
