import { Replicache } from 'replicache';
import type { WriteTransaction } from 'replicache';

export type Vial = {
  id: string;
  name: string;
  mass_mg: number;
  volume_ml: number;
  remaining_volume_ml: number;
  status: 'lyophilized' | 'reconstituted';
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
  logDose: async (tx: WriteTransaction, log: DoseLog) => {
    await tx.set(`log/${log.id}`, log);
    
    // Optimistic inventory decrement
    const vial = (await tx.get(`vial/${log.vial_id}`)) as Vial | undefined;
    if (vial) {
      const updatedVial = {
        ...vial,
        remaining_volume_ml: vial.remaining_volume_ml - (log.units_iu / 100) - 0.05, // 0.05mL dead space
      };
      await tx.set(`vial/${vial.id}`, updatedVial);
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
