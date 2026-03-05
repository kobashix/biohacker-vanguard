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
 * 
 * @param total_mass - Total amount in vial (mg, IU, or g)
 * @param volume_ml - BAC Water volume in mL
 * @param target_dose - Desired dose (mcg if mg, IU if IU, mg if g)
 * @param unit - 'mg' | 'IU' | 'g'
 */
export function calculateRequiredUnits(
  total_mass: number | string | Decimal,
  volume_ml: number | string | Decimal,
  target_dose: number | string | Decimal,
  unit: 'mg' | 'IU' | 'g' = 'mg'
): Decimal {
  const mass = new Decimal(total_mass || 0);
  const volume = new Decimal(volume_ml || 1);
  const dose = new Decimal(target_dose || 0);

  if (mass.isZero() || volume.isZero()) return new Decimal(0);

  if (unit === 'mg') {
    // 1. MG to MCG Math: (mg * 1000) / mL / 100 = mcg per unit
    const mcg_per_unit = mass.times(1000).dividedBy(volume).dividedBy(100);
    return dose.dividedBy(mcg_per_unit);
  } else if (unit === 'g') {
    // 2. Gram to MG Math: (g * 1000) / mL / 100 = mg per unit
    const mg_per_unit = mass.times(1000).dividedBy(volume).dividedBy(100);
    return dose.dividedBy(mg_per_unit);
  } else {
    // 3. IU to IU Math (e.g. HGH): (Total IU / Total mL) / 100 = IU per unit
    const iu_per_unit = mass.dividedBy(volume).dividedBy(100);
    return dose.dividedBy(iu_per_unit);
  }
}

/**
 * Validates dose safety against standard syringe capacities.
 */
export function validateDoseSafety(units: Decimal, syringe_scale: number = 1.0) {
  const errors: string[] = [];
  const max_units = syringe_scale * 100;
  if (units.gt(max_units)) errors.push(`Dose exceeds syringe capacity (${max_units} IU).`);
  if (units.gt(0) && units.lt(2)) errors.push("Dose volume too small for accurate measurement (< 2 IU).");
  return { isValid: errors.length === 0, errors };
}
