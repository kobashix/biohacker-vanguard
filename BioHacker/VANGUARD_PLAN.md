# 🛡️ BioHacker (by MMM): Strategic Implementation Plan

## 1. Project Vision
BioHacker is a clinical-grade, zero-knowledge, local-first bio-tracking platform engineered for high-precision pharmaceutical management. It prioritizes sub-millisecond responsiveness, absolute data privacy via E2EE, and a universal tracking logic for all pharmaceutical forms.

## 2. Tech Stack & Constraints
- **Framework:** Next.js 16 (React Server Components)
- **State/Sync:** Replicache (Local-first, LWW Conflict Resolution)
- **Security:** WebCrypto API (PBKDF2-100k, JWE for E2EE), Supabase Vault, PostgreSQL RLS
- **Math:** `Decimal.js` for floating-point precision
- **Optimization:** Next.js `use cache` directive for PK calculations

## 3. Core Engineering Pillars

### A. Reconstitution & Precision Math Engine
- **Objective:** Convert mass ($mg$) or units ($IU$) into Syringe Units ($IU$).
- **Multi-Unit Support:** Handles both $mg$-based (peptides) and $IU$-based (HGH) compounds.
- **Safety Guardrails:** Threshold warnings for volume overflow or measurement inaccuracy.

### B. Universal Inventory Management
- **States:** Supports **Powder (Dry)**, **Mixed (Liquid)**, and **Pill (Oral)**.
- **Automatic Stacking:** Duplicate vials/bottles are automatically grouped by Name, Mass, Unit, and State.
- **Bulk Addition:** Support for adding up to 20 vials at once with auto-indexing.
- **Blend Support:** Multi-compound vials (e.g., BPC-157 + TB-500) with independent dose calculation.

### C. Pharmacokinetic (PK) Modeling
- **Model:** Multi-compartment exponential decay.
- **Formula:** $k = \frac{\ln(2)}{t_{1/2}}$ for elimination constants.
- **Features:** Concurrent ester handling, fluctuation peak visualization, and $T_{max}$ identification.

### D. Adherence & Predictive Depletion
- **Log Dose:** Active logging interface that decrements physical inventory.
- **Wastage Calibration:** Automatic $0.05\text{mL}$ Needle Dead Space factor for every injection.
- **Pill Tracking:** Direct decrement of pill count for oral compounds.

### E. Zero-Knowledge Security (E2EE)
- **Encryption:** All medical data encrypted client-side into JWE strings via PBKDF2-100k.
- **Auth Wall:** Primary middleware enforcing session validation for all dashboard and API routes.

---

## 4. Completed Milestones (Sprint 1)

- [x] **Task 1: E2EE Cryptography Foundation**
    - PBKDF2-100k key derivation implemented.
    - WebCrypto JWE encryption wrappers verified.
- [x] **Task 2: Reconstitution Engine Core**
    - `Decimal.js` conversion logic live.
    - Multi-unit (mg/IU) support added.
- [x] **Task 3: Multi-Compartment PK Model**
    - Elimination constant $k$ logic implemented.
    - Support for concurrent esters added.
- [x] **Task 4: Universal Inventory & Wastage**
    - Grouped Powder view and auto-stacking implemented.
    - 0.05mL dead space deduction logic live.
    - Pill/Oral form tracking implemented.
- [x] **Task 5: Replicache & Supabase Sync**
    - Tenant-aware Push/Pull handlers live.
    - Full-stack deletion and update logic implemented.
- [x] **Task 6: Branding & UX**
    - Globally rebranded to BioHacker (by MMM).
    - Clinical-grade landing page and login portal live.

---
*Last Updated: 2026-03-05 | Lead Architect: Gemini CLI*
