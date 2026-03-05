import { Replicache } from 'replicache';
import type { WriteTransaction } from 'replicache';

export type Compound = {
  name: string;
  mass_mg: number;
  unit: 'mg' | 'IU';
};

export type Vial = {
  id: string;
  name: string;
  compounds: Compound[];
  volume_ml: number;
  remaining_volume_ml: number;
  status: 'powder' | 'mixed' | 'pill';
  pill_count?: number;
  remaining_pills?: number;
};

export type DoseLog = {
  id: string;
  vial_id: string;
  substance: string;
  dose_mcg: number;
  units_iu: number;
  timestamp: number;
};

// Define mutators for LWW (Last-Write-Wins) strategy
const mutators = {
  createVial: async (tx: WriteTransaction, vial: Vial) => {
    await tx.set(`vial/${vial.id}`, vial);
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
        const updatedVial = {
          ...vial,
          remaining_pills: Math.max(0, (vial.remaining_pills || 0) - log.dose_mcg), // For pills, dose_mcg stores pill count
        };
        await tx.set(`vial/${vial.id}`, updatedVial);
      } else {
        const updatedVial = {
          ...vial,
          remaining_volume_ml: Math.max(0, vial.remaining_volume_ml - (log.units_iu / 100) - 0.05), // 0.05mL dead space
        };
        await tx.set(`vial/${vial.id}`, updatedVial);
      }
    }
  },
};

export type M = typeof mutators;

let replicache: Replicache<M> | null = null;

export function getReplicache(userId: string) {
  if (typeof window === 'undefined') return null;

  if (!replicache) {
    replicache = new Replicache<M>({
      name: userId, // Per-user database isolation
      licenseKey: 'l00000000000000000000000000000001', // Trial key
      pushURL: '/api/replicache/push',
      pullURL: '/api/replicache/pull',
      mutators,
    });
  }

  return replicache;
}
