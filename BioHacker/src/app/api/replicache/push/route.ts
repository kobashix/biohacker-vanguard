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

  const { clientGroupID, mutations } = await request.json();
  if (clientGroupID !== user.id) return new Response('Forbidden', { status: 403 });

  for (const m of mutations) {
    const { name, args } = m;

    if (name === 'createVial' || name === 'updateVial') {
      await supabase.from('vials').upsert({
        id: args.id, user_id: user.id, name: args.name, status: args.status,
        volume_ml: args.volume_ml, remaining_volume_ml: args.remaining_volume_ml,
        pill_count: args.pill_count, compounds: args.compounds
      });
    }

    if (name === 'deleteVial') {
      await supabase.from('vials').delete().eq('id', args).eq('user_id', user.id);
    }

    if (name === 'createProtocol') {
      await supabase.from('protocols').upsert({
        id: args.id, user_id: user.id, vial_id: args.vial_id,
        dose_amount: args.dose_amount, frequency_hours: args.frequency_hours, start_time: args.start_time
      });
    }

    if (name === 'deleteProtocol') {
      await supabase.from('protocols').delete().eq('id', args).eq('user_id', user.id);
    }

    if (name === 'logDose') {
      await supabase.from('dose_logs').insert({
        id: args.id, user_id: user.id, vial_id: args.vial_id,
        substance: args.substance, dose_amount: args.dose_mcg, units_iu: args.units_iu, timestamp: args.timestamp
      });

      // Unified Decrement
      const { data: vial } = await supabase.from('vials').select('*').eq('id', args.vial_id).single();
      if (vial) {
        if (vial.status === 'pill') {
          await supabase.from('vials').update({ pill_count: Math.max(0, (vial.pill_count || 0) - args.dose_mcg) }).eq('id', args.vial_id);
        } else {
          await supabase.from('vials').update({ remaining_volume_ml: Math.max(0, (vial.remaining_volume_ml || 0) - (args.units_iu / 100) - 0.05) }).eq('id', args.vial_id);
        }
      }
    }
  }

  return NextResponse.json({});
}
