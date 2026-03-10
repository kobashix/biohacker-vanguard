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

  const { clientID, mutations } = await request.json();
  // Note: clientGroupID is a Replicache-internal UUID, NOT user.id.
  // Auth is already secured via supabase.auth.getUser() above.

  let lastMutationID = 0;
  if (clientID) {
    const { data } = await supabase.from('replicache_clients').select('last_mutation_id').eq('id', clientID).single();
    lastMutationID = data?.last_mutation_id ?? 0;
  }

  for (const m of mutations) {
    // Skip already-processed mutations (idempotency)
    if (m.id <= lastMutationID) continue;

    const { name, args } = m;

    if (name === 'createVial' || name === 'updateVial') {
      const { error } = await supabase.from('vials').upsert({
        id: args.id, user_id: user.id, name: args.name, status: args.status,
        volume_ml: args.volume_ml, remaining_volume_ml: args.remaining_volume_ml,
        pill_count: args.pill_count, compounds: args.compounds
      });
      if (error) console.error(`[PUSH ERROR] ${name} failed:`, error);
    }

    if (name === 'deleteVial') {
      const { error } = await supabase.from('vials').delete().eq('id', args).eq('user_id', user.id);
      if (error) console.error(`[PUSH ERROR] ${name} failed:`, error);
    }

    if (name === 'createProtocol') {
      const { error } = await supabase.from('protocols').upsert({
        id: args.id, user_id: user.id, vial_id: args.vial_id,
        dose_amount: args.dose_amount, frequency_hours: args.frequency_hours,
        days_on: args.days_on, days_off: args.days_off, start_time: args.start_time,
        skip_weekends: args.skip_weekends, time_buckets: args.time_buckets
      });
      if (error) console.error(`[PUSH ERROR] ${name} failed:`, error);
    }

    if (name === 'deleteProtocol') {
      const { error } = await supabase.from('protocols').delete().eq('id', args).eq('user_id', user.id);
      if (error) console.error(`[PUSH ERROR] deleteProtocol failed for ID ${args}:`, error);
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

    if (name === 'seedDemoData' || name === 'restoreBackup') {
      const { vials, protocols, logs, subjectiveLogs, supplies, cycles } = args;

      try {
        if (vials && vials.length > 0) {
          const { error } = await supabase.from('vials').upsert(vials.map((v: any) => ({
            id: v.id, user_id: user.id, name: v.name, status: v.status, volume_ml: v.volume_ml,
            remaining_volume_ml: v.remaining_volume_ml, pill_count: v.pill_count, compounds: v.compounds
          })));
          if (error) console.error('[SYNC ERROR] Vials Upsert Failed:', error);
        }
        if (protocols && protocols.length > 0) {
          const { error } = await supabase.from('protocols').upsert(protocols.map((p: any) => ({
            id: p.id, user_id: user.id, vial_id: p.vial_id, dose_amount: p.dose_amount, frequency_hours: p.frequency_hours,
            days_on: p.days_on, days_off: p.days_off, start_time: p.start_time, skip_weekends: p.skip_weekends, time_buckets: p.time_buckets
          })));
          if (error) console.error('[SYNC ERROR] Protocols Upsert Failed:', error);
        }
        if (logs && logs.length > 0) {
          const { error } = await supabase.from('dose_logs').upsert(logs.map((l: any) => ({
            id: l.id, user_id: user.id, vial_id: l.vial_id, substance: l.substance, dose_amount: l.dose_amount,
            units_iu: l.units_iu, timestamp: l.timestamp, injection_site: l.injection_site
          })));
          if (error) console.error('[SYNC ERROR] Dose Logs Upsert Failed:', error);
        }
        if (subjectiveLogs && subjectiveLogs.length > 0) {
          const { error } = await supabase.from('subjective_logs').upsert(subjectiveLogs.map((s: any) => ({
            id: s.id, user_id: user.id, timestamp: s.timestamp, mood: s.mood, energy: s.energy, sleep_quality: s.sleep_quality,
            soreness: s.soreness, notes: s.notes
          })));
          if (error) console.error('[SYNC ERROR] Subjective Logs Upsert Failed:', error);
        }
        if (supplies && supplies.length > 0) {
          const { error } = await supabase.from('supplies').upsert(supplies.map((sup: any) => ({
            id: sup.id, user_id: user.id, name: sup.name, count: sup.count, unit: sup.unit
          })));
          if (error) console.error('[SYNC ERROR] Supplies Upsert Failed:', error);
        }
        if (cycles && cycles.length > 0) {
          const { error } = await supabase.from('cycles').upsert(cycles.map((c: any) => ({
            id: c.id, user_id: user.id, name: c.name, start_date: c.start_date, end_date: c.end_date, notes: c.notes
          })));
          if (error) console.error('[SYNC ERROR] Cycles Upsert Failed:', error);
        }
      } catch (err) {
        console.error('[SYNC ERROR] Fatal exception during demo seeding:', err);
      }
    }

    if (name === 'purgeAllData') {
      // Must delete in order due to foreign key constraints, or just delete tables that depend on user_id
      const tables = ['dose_logs', 'subjective_logs', 'supplies', 'cycles', 'bio_markers', 'protocols', 'vials'];
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', user.id);
      }
    }
  }

  // Update the last processed mutation ID for this client
  if (clientID && mutations.length > 0) {
    const maxMutationId = Math.max(...mutations.map((m: { id: number }) => m.id));
    await supabase.from('replicache_clients').upsert({
      id: clientID,
      client_group_id: user.id,
      last_mutation_id: maxMutationId,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({});
}
