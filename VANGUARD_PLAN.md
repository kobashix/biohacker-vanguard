# 🛡️ Vanguard Pro: Strategic Implementation Plan

## 1. Project Vision
Vanguard Pro is a zero-knowledge, local-first bio-tracking platform engineered for high-precision pharmaceutical management. It prioritizes clinical-grade accuracy, sub-millisecond responsiveness, and absolute data privacy through E2EE.

## 2. Tech Stack & Constraints
- **Framework:** Next.js 16 (React Server Components)
- **State/Sync:** Replicache (Local-first, LWW Conflict Resolution)
- **Security:** WebCrypto API (JWE for E2EE), Supabase Vault, PostgreSQL RLS
- **Math:** `Decimal.js` for floating-point precision
- **Mobile:** Expo/React Native + SQLite (WAL mode)
- **Optimization:** Next.js `use cache` directive for PK calculations

## 3. Core Engineering Pillars

### A. Reconstitution & Precision Math Engine
- **Objective:** Convert lyophilized mass ($mg$) and solvent volume ($mL$) into Insulin Units ($IU$).
- **Syringe Support:** 0.3ml, 0.5ml, and 1ml scales.
- **Safety Guardrails:** Threshold warnings for volume overflow or measurement inaccuracy.

### B. Pharmacokinetic (PK) Modeling
- **Model:** Multi-compartment exponential decay.
- **Formula:** $k = \frac{\ln(2)}{t_{1/2}}$ for elimination constants.
- **Features:** Concurrent ester handling (e.g., Cypionate vs. Acetate), fluctuation peak visualization, and $T_{max}$ identification.

### C. Inventory & Adherence Logic
- **Predictive Depletion:** Automatic stock decrement including a $0.05\text{mL}$ Needle Dead Space wastage factor.
- **Automation:** Low-stock triggers based on active dosing schedules and projected end-of-cycle.

### D. Zero-Knowledge Security (E2EE)
- **Encryption:** All medical data (drugs, doses, biomarkers) encrypted client-side into JWE strings.
- **Sync:** Server acts as a "dumb" storage for encrypted blobs; decryption keys never leave the client.

### E. Biometric Correlation
- **Ingestion:** Telemetry (RHR, Blood Pressure) from Apple Health/Google Fit.
- **Analytics:** Heatmap overlays of biometrics against modeled serum levels using Pearson/Spearman correlation.

## 4. Finalized Task List (Sprint 1)

- [x] **Task 1: E2EE Cryptography Foundation (`src/lib/crypto.ts`)**
    - Implement WebCrypto wrappers for JWE.
    - Create `encryptPayload` and `decryptPayload` utilities.
- [x] **Task 2: Reconstitution Engine Core (`src/lib/math.ts`)**
    - Implement `Decimal.js` conversion logic.
    - Add safety guardrails for standard syringe scales.
- [x] **Task 3: Multi-Compartment PK Model (`src/lib/pk.ts`)**
    - Implement the elimination constant $k$ logic.
    - Build time-series generator for concurrent esters.
    - Integrate Next.js 16 `use cache`.
- [x] **Task 4: Inventory & Wastage System (`src/lib/inventory.ts`)**
    - Implement $0.05\text{mL}$ dead space deduction logic.
    - Build predictive depletion calculator.
- [ ] **Task 5: Replicache & Supabase Scaffolding**
    - Install `replicache` and `jose`.
    - Define initial schema for encrypted medical logs.

---
*Created on 2026-03-05 | Lead Architect: Gemini CLI*
