/**
 * BioHacker: Inventory & Adherence Logic
 * Calibration for physical stock and predictive depletion.
 */
import Decimal from "decimal.js";
import { NEEDLE_DEAD_SPACE_ML } from "./math";

/**
 * Calculates volume to decrement from inventory for a single liquid dose.
 * Includes calibration for needle dead space.
 * 
 * @param dose_iu - Dose volume in Insulin Units
 */
export function calculateVolumeDeduction(dose_iu: number | string | Decimal): Decimal {
  const dose_ml = new Decimal(dose_iu).dividedBy(100);
  return dose_ml.plus(NEEDLE_DEAD_SPACE_ML);
}

/**
 * Estimates the remaining number of doses in a vial (liquid or pill).
 */
export function estimateRemainingDoses(
  vial: { status: string; remaining_volume_ml: number; remaining_pills?: number },
  average_dose_val: number | Decimal // IU for liquid, count for pills
): number {
  if (vial.status === 'pill') {
    const rem = new Decimal(vial.remaining_pills || 0);
    const dose = new Decimal(average_dose_val || 1);
    if (dose.isZero()) return 0;
    return rem.dividedBy(dose).floor().toNumber();
  } else {
    const rem = new Decimal(vial.remaining_volume_ml || 0);
    const deduction_per_dose = calculateVolumeDeduction(new Decimal(average_dose_val || 25));
    if (deduction_per_dose.isZero()) return 0;
    return rem.dividedBy(deduction_per_dose).floor().toNumber();
  }
}
