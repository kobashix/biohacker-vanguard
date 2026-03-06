import { Replicache } from 'replicache';
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
  seedDemoData: async (tx: WriteTransaction, { vials, protocols, logs }: { vials: Vial[], protocols: Protocol[], logs: DoseLog[] }) => {
    for (const v of vials) await tx.set(`vial/${v.id}`, v);
    for (const p of protocols) await tx.set(`protocol/${p.id}`, p);
    for (const l of logs) await tx.set(`log/${l.id}`, l);
  },
};

export type M = typeof mutators;

let replicache: Replicache<M> | null = null;

export function getReplicache(userId: string) {
  if (typeof window === 'undefined') return null;
  if (!replicache) {
    replicache = new Replicache<M>({
      name: userId,
      licenseKey: 'l00000000000000000000000000000001',
      pushURL: '/api/replicache/push',
      pullURL: '/api/replicache/pull',
      mutators,
    });
  }
  return replicache;
}
