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
        remaining_volume_ml: args.remaining_volume_ml,
      });
    }

    if (name === 'updateVial') {
      await supabase.from('vials').update({
        encrypted_payload: JSON.stringify(args),
        remaining_volume_ml: args.remaining_volume_ml
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
        dosage_iu: args.units_iu,
      });

      // 2. Decrement vial volume in DB
      const { data: vial } = await supabase.from('vials').select('remaining_volume_ml').eq('id', args.vial_id).single();
      if (vial) {
        const newVol = Math.max(0, vial.remaining_volume_ml - (args.units_iu / 100) - 0.05);
        await supabase.from('vials').update({ remaining_volume_ml: newVol }).eq('id', args.vial_id);
      }
    }
  }

  return NextResponse.json({});
}
