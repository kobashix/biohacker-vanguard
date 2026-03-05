# 🧠 BioHacker (by MMM): Core Program Logic

This document outlines the clinical and mathematical logic governing every feature in the BioHacker platform.

## 1. Reconstitution Logic (Liquid)
The system uses `Decimal.js` to ensure zero floating-point errors when converting powder mass to syringe volume.

### MG-Based Compounds (Peptides)
1. **Concentration:** $mcg/mL = (Mass_{mg} \times 1000) / Volume_{mL}$
2. **Potency per Unit:** $mcg/IU = (mcg/mL) / 100$
3. **Required Volume:** $Units_{IU} = Dose_{mcg} / (mcg/IU)$

### IU-Based Compounds (HGH)
1. **Potency per Unit:** $IU/IU = (Total\_IU / Volume_{mL}) / 100$
2. **Required Volume:** $Units_{IU} = Target\_IU / (Potency\_per\_Unit)$

---

## 2. Inventory Depletion Logic
Inventory is decremented immediately upon logging a dose to maintain physical stock accuracy.

### Injections (Mixed State)
Every injection includes a calibrated wastage factor for the "Needle Dead Space" (the volume trapped in the needle tip).
- **Formula:** $Vol_{new} = Vol_{current} - (Dose_{IU} / 100) - 0.05\text{mL}$
- **Safety:** Remaining volume is clamped at $0$.

### Orals (Pill State)
Pill inventory is a simple integer decrement.
- **Formula:** $Pills_{remaining} = Pills_{current} - Count_{taken}$

---

## 3. Automatic Stacking Logic
To prevent UI clutter, the interface automatically collapses duplicate inventory items into a single stack.

- **Stacking Key:** `[Name] + [Status] + [Compound_Array] + [Current_Volume/Pill_Count]`
- **Behavior:** If a new vial matches an existing stack exactly (including its remaining volume), it is added to the count.
- **Isolation:** Mixed vials with different remaining volumes will *not* stack, as they represent distinct physical solutions.

---

## 4. Multi-Compound (Blend) Logic
Vials containing multiple compounds (e.g., BPC-157 + TB-500) are treated as a single physical entity with multiple mathematical potencies.

- **Dose Calculation:** The user selects a "Target Compound" from the blend.
- **Execution:** The math engine runs the Reconstitution Logic using only the mass/unit of the *selected* compound, but decrements the *entire* vial's volume.

---

## 5. Security Logic (Zero-Knowledge)
Decryption keys never reach the server. The server acts as a "dumb" blob store for JWE strings.

1. **Key Derivation:** $Password + Salt \xrightarrow{\text{PBKDF2-100k}} 256\text{-bit AES Key}$
2. **Encryption:** $Payload_{JSON} \xrightarrow{\text{AES-GCM-256}} JWE\text{ String}$
3. **Storage:** Only the JWE string and the `user_id` are sent to Supabase.

---

## 6. Pharmacokinetic (PK) Logic
Predicts blood serum levels based on injection history using exponential decay.

- **Elimination Constant:** $k = \ln(2) / t_{1/2}$
- **Serum Level at time $t$:** $C(t) = Dose \times e^{-kt}$
- **Accumulation:** For multiple injections, $C_{total}(t) = \sum (Dose_i \times e^{-k(t-t_i)})$
