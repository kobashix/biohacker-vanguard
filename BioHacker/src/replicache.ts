import { Replicache, dropDatabase } from 'replicache';
import type { WriteTransaction } from 'replicache';
import { NEEDLE_DEAD_SPACE_ML } from './math';

export type Compound = {
  name: string;
  mass_mg: number;
  unit: 'mg' | 'IU' | 'g';
};

export type Vial = {
  id: string;
  name: string;
  compounds: Compound[];
  volume_ml: number;
  remaining_volume_ml: number;
  status: 'powder' | 'mixed' | 'pill';
  pill_count?: number; 
};

export type DoseLog = {
  id: string;
  vial_id: string;
  substance: string;
  dose_amount: number;
  unit: string; 
  units_iu: number; 
  timestamp: number;
  injection_site?: string;
};

export type Protocol = {
  id: string;
  vial_id: string;
  dose_amount: number;
  frequency_hours: number;
  days_on?: number;
  days_off?: number;
  start_time: number;
  skip_weekends?: boolean;
  time_buckets?: ('morning' | 'afternoon' | 'night')[];
  notes?: string;
};

export type SubjectiveLog = {
  id: string;
  timestamp: number;
  mood: number;
  energy: number;
  sleep_quality: number;
  soreness: number;
  notes?: string;
};

export type Supply = {
  id: string;
  name: string;
  count: number;
  unit: string;
};

export type Cycle = {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  vial_ids?: string[];
  notes?: string;
};

const mutators = {
  createVial: async (tx: WriteTransaction, vial: Vial) => {
    await tx.set(`vial/${vial.id}`, vial);
  },
  createProtocol: async (tx: WriteTransaction, protocol: Protocol) => {
    await tx.set(`protocol/${protocol.id}`, protocol);
  },
  deleteProtocol: async (tx: WriteTransaction, id: string) => {
    await tx.del(`protocol/${id}`);
  },
  updateVial: async (tx: WriteTransaction, update: Partial<Vial> & { id: string }) => {
    const prev = (await tx.get(`vial/${update.id}`)) as Vial | undefined;
    if (prev) {
      await tx.set(`vial/${update.id}`, { ...prev, ...update });
    }
  },
  deleteVial: async (tx: WriteTransaction, id: string) => {
    await tx.del(`vial/${id}`);
  },
  logDose: async (tx: WriteTransaction, log: DoseLog) => {
    await tx.set(`log/${log.id}`, log);
    const vial = (await tx.get(`vial/${log.vial_id}`)) as Vial | undefined;
    if (vial) {
      if (vial.status === 'pill') {
        await tx.set(`vial/${vial.id}`, {
          ...vial,
          pill_count: Math.max(0, (vial.pill_count || 0) - log.dose_amount),
        });
      } else if (vial.status === 'mixed') {
        await tx.set(`vial/${vial.id}`, {
          ...vial,
          remaining_volume_ml: Math.max(0, vial.remaining_volume_ml - (log.units_iu / 100) - NEEDLE_DEAD_SPACE_ML.toNumber()), 
        });
      }
    }
  },
  logSubjective: async (tx: WriteTransaction, log: SubjectiveLog) => {
    await tx.set(`subjective/${log.id}`, log);
  },
  updateSupply: async (tx: WriteTransaction, supply: Supply) => {
    await tx.set(`supply/${supply.id}`, supply);
  },
  createCycle: async (tx: WriteTransaction, cycle: Cycle) => {
    await tx.set(`cycle/${cycle.id}`, cycle);
  },
  deleteCycle: async (tx: WriteTransaction, id: string) => {
    await tx.del(`cycle/${id}`);
  },
  seedDemoData: async (tx: WriteTransaction, { vials, protocols, logs, subjectiveLogs, supplies, cycles }: { vials: Vial[], protocols: Protocol[], logs: DoseLog[], subjectiveLogs?: SubjectiveLog[], supplies?: Supply[], cycles?: Cycle[] }) => {
    for (const v of vials) await tx.set(`vial/${v.id}`, v);
    for (const p of protocols) await tx.set(`protocol/${p.id}`, p);
    for (const l of logs) await tx.set(`log/${l.id}`, l);
    for (const s of subjectiveLogs || []) await tx.set(`subjective/${s.id}`, s);
    for (const sup of supplies || []) await tx.set(`supply/${sup.id}`, sup);
    for (const c of cycles || []) await tx.set(`cycle/${c.id}`, c);
  },
  restoreBackup: async (tx: WriteTransaction, p: { vials: Vial[], protocols: Protocol[], logs: DoseLog[], subjectiveLogs: SubjectiveLog[], supplies: Supply[], cycles: Cycle[] }) => {
    // Pure raw hydration to bypass triggers mathematically modifying other records
    for (const v of p.vials || []) await tx.set(`vial/${v.id}`, v);
    for (const pr of p.protocols || []) await tx.set(`protocol/${pr.id}`, pr);
    for (const l of p.logs || []) await tx.set(`log/${l.id}`, l);
    for (const s of p.subjectiveLogs || []) await tx.set(`subjective/${s.id}`, s);
    for (const sup of p.supplies || []) await tx.set(`supply/${sup.id}`, sup);
    for (const c of p.cycles || []) await tx.set(`cycle/${c.id}`, c);
  },
  purgeAllData: async (tx: WriteTransaction) => {
    const prefixes = ['vial/', 'protocol/', 'log/', 'subjective/', 'supply/', 'cycle/'];
    for (const prefix of prefixes) {
      const keys = await tx.scan({ prefix }).keys().toArray();
      for (const key of keys) {
        await tx.del(key);
      }
    }
  },
};

export type M = typeof mutators;

let replicache: Replicache<M> | null = null;
let replicacheUserId: string | null = null;

export function getReplicache(userId: string) {
  if (typeof window === 'undefined') return null;
  if (!userId) return null;
  // Recreate instance if user changed (e.g. after login/logout or fresh deploy)
  if (replicache && replicacheUserId !== userId) {
    replicache.close();
    replicache = null;
    replicacheUserId = null;
  }
  if (!replicache) {
    replicacheUserId = userId;
    replicache = new Replicache<M>({
      name: `biohacker-${userId}`,
      licenseKey: 'l00000000000000000000000000000001',
      pushURL: '/api/replicache/push',
      pullURL: '/api/replicache/pull',
      mutators,
    });
  }
  return replicache;
}

export async function dropReplicache(userId: string) {
  if (typeof window === 'undefined' || !userId) return;
  const dbName = `biohacker-${userId}`;
  
  if (replicache && replicacheUserId === userId) {
    console.log(`[replicache] Closing active instance for ${userId} before drop`);
    await replicache.close();
    replicache = null;
    replicacheUserId = null;
  }
  
  console.log(`[replicache] Dropping database ${dbName}`);
  try {
    await dropDatabase(dbName);
    // Nuclear fallback: delete the indexedDB database directly if Replicache helper fails
    window.indexedDB.deleteDatabase(`replicache:${dbName}`);
  } catch (e) {
    console.warn(`[replicache] dropDatabase failed for ${dbName}, trying fallback`, e);
    window.indexedDB.deleteDatabase(`replicache:${dbName}`);
  }
}
