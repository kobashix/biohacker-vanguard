/**
 * Vanguard Pro: Precision Mathematical Engine
 * Powered by Decimal.js for high-accuracy pharmaceutical dosing.
 */
import Decimal from "decimal.js";

// Constants for Syringe Scales
export const SYRINGE_SCALES = {
  U30: { capacity_ml: 0.3, capacity_iu: 30, label: "0.3mL (30 IU)" },
  U50: { capacity_ml: 0.5, capacity_iu: 50, label: "0.5mL (50 IU)" },
  U100: { capacity_ml: 1.0, capacity_iu: 100, label: "1.0mL (100 IU)" },
};

// Calibration Constants
export const NEEDLE_DEAD_SPACE_ML = new Decimal(0.05);

/**
 * Calculates the required IU (Insulin Units) for a target dose.
 * 
 * @param mass_mg - Lyophilized peptide mass in mg
 * @param volume_ml - Solvent (BAC Water) volume in mL
 * @param target_mcg - Desired dose in mcg
 * @returns Decimal object representing required units (IU)
 */
export function calculateRequiredUnits(
  mass_mg: number | string,
  volume_ml: number | string,
  target_mcg: number | string
): Decimal {
  const mass = new Decimal(mass_mg || 0);
  const volume = new Decimal(volume_ml || 1);
  const dose = new Decimal(target_mcg || 0);

  if (mass.isZero() || volume.isZero()) return new Decimal(0);

  // 1. Calculate concentration (mcg per mL)
  const total_mcg = mass.times(1000);
  const mcg_per_ml = total_mcg.dividedBy(volume);

  // 2. Calculate mcg per IU (Assuming U-100 syringe: 100 IU = 1mL)
  const mcg_per_unit = mcg_per_ml.dividedBy(100);

  // 3. Calculate required units
  return dose.dividedBy(mcg_per_unit);
}

/**
 * Validates dose safety against standard syringe capacities and measurement precision.
 */
export function validateDoseSafety(units: Decimal, syringe_scale: number = 1.0) {
  const errors: string[] = [];
  const max_units = syringe_scale * 100;

  if (units.gt(max_units)) {
    errors.push(`Dose exceeds syringe capacity (${max_units} IU).`);
  }

  if (units.gt(0) && units.lt(2)) {
    errors.push("Dose volume too small for accurate measurement (< 2 IU).");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
