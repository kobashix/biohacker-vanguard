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
  compound_unit: 'mg' | 'IU' | 'g' = 'mg',
  dose_unit?: string
): Decimal {
  const mass = new Decimal(total_mass || 0);
  const volume = new Decimal(volume_ml || 1);
  const dose = new Decimal(target_dose || 0);

  if (mass.isZero() || volume.isZero()) return new Decimal(0);

  const dUnit = dose_unit || (compound_unit === 'mg' ? 'mcg' : compound_unit === 'g' ? 'mg' : 'IU');

  // IU specifically bypasses mg conversions
  if (compound_unit === 'IU') {
    const iu_per_unit = mass.dividedBy(volume).dividedBy(100);
    return dose.dividedBy(iu_per_unit);
  }

  // Find base mass in mg
  let mass_in_mg = new Decimal(0);
  if (compound_unit === 'mg') mass_in_mg = mass;
  else if (compound_unit === 'g') mass_in_mg = mass.times(1000);

  // Find concentration in mg/mL
  const mg_per_ml = mass_in_mg.dividedBy(volume);
  
  // Find dose in mg
  let dose_in_mg = new Decimal(0);
  if (dUnit === 'mcg') dose_in_mg = dose.dividedBy(1000);
  else if (dUnit === 'mg') dose_in_mg = dose;
  else if (dUnit === 'g') dose_in_mg = dose.times(1000);
  // Unrecognized unit? Fallback to assuming dose is mcg for mg vials
  else dose_in_mg = dose.dividedBy(1000); 

  // Volume in mL
  const required_ml = dose_in_mg.dividedBy(mg_per_ml);

  // Convert to U100 Insulin Units (1mL = 100 IU)
  return required_ml.times(100);
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
