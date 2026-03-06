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

### Gram-Based Compounds
1. **Potency per Unit:** $mg/IU = (Mass_{g} \times 1000) / Volume_{mL} / 100$
2. **Required Volume:** $Units_{IU} = Dose_{mg} / (Potency\_per\_Unit)$

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

## 3. Advanced Protocol Logic (New)
BioHacker supports complex administration patterns beyond simple intervals.

### X Days On / Y Days Off
- **Cycle Length:** $Total\_Period = X + Y$
- **Eligibility:** A dose is projected if $(Days\_Since\_Start \pmod{Total\_Period}) < X$.
- **Adherence:** Missed doses are flagged if the current time exceeds the `start_time` + `interval` and no log exists for that window.

---

## 4. Health & Subjective Logic (New)
### Correlation Engine
Subjective metrics (Mood, Energy, Sleep) are mapped on a 1-10 scale.
- **Overlay:** These data points are timestamped and overlaid on the PK serum graph.
- **Goal:** Identify the "Therapeutic Window" where subjective wellbeing is highest relative to serum concentration.

### Injection Site Rotation
Tracks the physical location of the last administration to minimize tissue trauma.
- **Logic:** Recommends the next site based on the least recently used location in a 4-point or 8-point map.

---

## 5. Security Logic (Seamless)
Decryption keys are managed by Supabase Auth and protected by PostgreSQL Row-Level Security (RLS).

1. **Identity Protection:** All queries are filtered by `auth.uid() = user_id`.
2. **Encryption at Rest:** All structured columns are encrypted using AES-256 by the infrastructure provider.
3. **Multi-Device Sync:** Replicache handles sub-millisecond local-to-server synchronization using a Last-Write-Wins (LWW) conflict resolution strategy.
