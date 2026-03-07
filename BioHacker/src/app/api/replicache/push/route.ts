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
        dose_amount: args.dose_amount, frequency_hours: args.frequency_hours,
        days_on: args.days_on, days_off: args.days_off, start_time: args.start_time,
        skip_weekends: args.skip_weekends, time_buckets: args.time_buckets
      });
    }

    if (name === 'deleteProtocol') {
      await supabase.from('protocols').delete().eq('id', args).eq('user_id', user.id);
    }

    if (name === 'logSubjective') {
      await supabase.from('subjective_logs').upsert({
        id: args.id, user_id: user.id, timestamp: args.timestamp,
        mood: args.mood, energy: args.energy, sleep_quality: args.sleep_quality,
        soreness: args.soreness, notes: args.notes
      });
    }

    if (name === 'updateSupply') {
      await supabase.from('supplies').upsert({
        id: args.id, user_id: user.id, name: args.name,
        count: args.count, unit: args.unit
      });
    }

    if (name === 'createCycle') {
      await supabase.from('cycles').upsert({
        id: args.id, user_id: user.id, name: args.name,
        start_date: args.start_date, end_date: args.end_date, notes: args.notes
      });
    }

    if (name === 'logDose') {
      await supabase.from('dose_logs').insert({
        id: args.id, user_id: user.id, vial_id: args.vial_id,
        substance: args.substance, dose_amount: args.dose_amount, 
        units_iu: args.units_iu, timestamp: args.timestamp,
        injection_site: args.injection_site
      });

      const { data: vial } = await supabase.from('vials').select('*').eq('id', args.vial_id).single();
      if (vial) {
        if (vial.status === 'pill') {
          await supabase.from('vials').update({ pill_count: Math.max(0, (vial.pill_count || 0) - args.dose_amount) }).eq('id', args.vial_id);
        } else if (vial.status === 'mixed') {
          await supabase.from('vials').update({ remaining_volume_ml: Math.max(0, (vial.remaining_volume_ml || 0) - (args.units_iu / 100) - 0.05) }).eq('id', args.vial_id);
        }
      }
    }

    if (name === 'restoreBackup') {
      const { vials, protocols, logs, subjectiveLogs, supplies, cycles } = args;
      
      if (vials && vials.length > 0) {
        await supabase.from('vials').upsert(vials.map((v: any) => ({ ...v, user_id: user.id })));
      }
      if (protocols && protocols.length > 0) {
        await supabase.from('protocols').upsert(protocols.map((p: any) => ({ ...p, user_id: user.id })));
      }
      if (logs && logs.length > 0) {
        await supabase.from('dose_logs').upsert(logs.map((l: any) => ({ ...l, user_id: user.id })));
      }
      if (subjectiveLogs && subjectiveLogs.length > 0) {
        await supabase.from('subjective_logs').upsert(subjectiveLogs.map((s: any) => ({ ...s, user_id: user.id })));
      }
      if (supplies && supplies.length > 0) {
        await supabase.from('supplies').upsert(supplies.map((sup: any) => ({ ...sup, user_id: user.id })));
      }
      if (cycles && cycles.length > 0) {
        await supabase.from('cycles').upsert(cycles.map((c: any) => ({ ...c, user_id: user.id })));
      }
    }
  }

  return NextResponse.json({});
}
