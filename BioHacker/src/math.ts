/**
 * BioHacker: Precision Mathematical Engine
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
 * Handles both mg-based (mcg dose) and IU-based (IU dose) compounds.
 * 
 * @param total_mass - Total amount in vial (mg or IU)
 * @param volume_ml - BAC Water volume in mL
 * @param target_dose - Desired dose (mcg if mg-based, IU if IU-based)
 * @param unit - 'mg' or 'IU'
 * @returns Decimal object representing required units (IU)
 */
export function calculateRequiredUnits(
  total_mass: number | string | Decimal,
  volume_ml: number | string | Decimal,
  target_dose: number | string | Decimal,
  unit: 'mg' | 'IU' = 'mg'
): Decimal {
  const mass = new Decimal(total_mass || 0);
  const volume = new Decimal(volume_ml || 1);
  const dose = new Decimal(target_dose || 0);

  if (mass.isZero() || volume.isZero()) return new Decimal(0);

  if (unit === 'mg') {
    // 1. MG to MCG Math
    const total_mcg = mass.times(1000);
    const mcg_per_ml = total_mcg.dividedBy(volume);
    const mcg_per_unit = mcg_per_ml.dividedBy(100); // 100 IU per 1mL
    return dose.dividedBy(mcg_per_unit);
  } else {
    // 2. IU to IU Math (e.g. HGH)
    // Potency per Unit = (Total IU / Total mL) / 100
    const potency_per_unit = mass.dividedBy(volume).dividedBy(100);
    return dose.dividedBy(potency_per_unit);
  }
}

/**
 * Validates dose safety against standard syringe capacities.
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

  return { isValid: errors.length === 0, errors };
}
