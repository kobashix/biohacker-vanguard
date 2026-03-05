/**
 * Vanguard Pro: Inventory & Adherence Logic
 * Calibration for physical stock and predictive depletion.
 */
import Decimal from "decimal.js";
import { NEEDLE_DEAD_SPACE_ML } from "./math";

export interface Vial {
  id: string;
  name: string;
  total_volume_ml: Decimal;
  remaining_volume_ml: Decimal;
}

/**
 * Calculates volume to decrement from inventory for a single dose.
 * Includes calibration for needle dead space.
 * 
 * @param dose_iu - Dose volume in Insulin Units
 */
export function calculateVolumeDeduction(dose_iu: number | string | Decimal): Decimal {
  const dose_ml = new Decimal(dose_iu).dividedBy(100);
  return dose_ml.plus(NEEDLE_DEAD_SPACE_ML);
}

/**
 * Estimates the remaining number of doses in a vial.
 */
export function estimateRemainingDoses(
  remaining_ml: Decimal | number,
  average_dose_iu: number | Decimal
): number {
  const rem = new Decimal(remaining_ml);
  const deduction_per_dose = calculateVolumeDeduction(new Decimal(average_dose_iu));
  
  if (deduction_per_dose.isZero()) return 0;
  
  return rem.dividedBy(deduction_per_dose).floor().toNumber();
}
