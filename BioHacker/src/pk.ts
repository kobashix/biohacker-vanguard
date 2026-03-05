/**
 * Vanguard Pro: Pharmacokinetics (PK) Engine
 * Multi-compartment exponential decay model for serum level prediction.
 */
import Decimal from "decimal.js";

export interface Ester {
  name: string;
  half_life_hours: number;
}

export interface Injection {
  timestamp: Date;
  dose_mg: number;
  ester: Ester;
}

export interface PKDatapoint {
  time_hours: number;
  serum_level: number;
}

/**
 * Calculates the elimination constant (k) for an ester.
 */
export function calculateEliminationConstant(half_life_hours: number): number {
  return Math.log(2) / half_life_hours;
}

/**
 * Generates a time-series model of serum levels based on injection history.
 * 
 * @param injections - Array of historical and planned injections
 * @param duration_hours - How far into the future to model
 * @param resolution_hours - Granularity of the model (e.g., 1 hour steps)
 */
export function generatePKModel(
  injections: Injection[],
  duration_hours: number = 72,
  resolution_hours: number = 1
): PKDatapoint[] {
  const model: PKDatapoint[] = [];
  const start_time = injections.length > 0 
    ? Math.min(...injections.map(i => i.timestamp.getTime())) 
    : Date.now();

  for (let t = 0; t <= duration_hours; t += resolution_hours) {
    let cumulative_level = new Decimal(0);

    for (const injection of injections) {
      const time_since_injection = (start_time + (t * 3600000) - injection.timestamp.getTime()) / 3600000;
      
      if (time_since_injection >= 0) {
        const k = calculateEliminationConstant(injection.ester.half_life_hours);
        // Formula: C(t) = D * exp(-k * t)
        const current_level = new Decimal(injection.dose_mg).times(Math.exp(-k * time_since_injection));
        cumulative_level = cumulative_level.plus(current_level);
      }
    }

    model.push({
      time_hours: t,
      serum_level: cumulative_level.toNumber(),
    });
  }

  return model;
}
