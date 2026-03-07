// ─── COMPOUND DATABASE ──────────────────────────────────────────────────────
// Comprehensive list used for autocomplete / select dropdown in VialManager.
// Organized by category; all entries appear in sorted select options.

export const COMPOUND_DATABASE = [
  // ── PEPTIDES: Recovery & Healing ──
  "BPC-157",
  "TB-500 (Thymosin Beta-4)",
  "BPC-157 + TB-500 (Blend)",
  "KPV",
  "VIP (Vasoactive Intestinal Peptide)",
  "LL-37",
  "Thymosin Alpha-1",
  "Larazotide",
  "GHK-Cu",
  "Epitalon",
  "Semax",
  "Selank",

  // ── PEPTIDES: GH Secretagogues ──
  "CJC-1295 (with DAC)",
  "CJC-1295 (No DAC / Mod GRF 1-29)",
  "Ipamorelin",
  "CJC-1295 + Ipamorelin (Blend)",
  "GHRP-2",
  "GHRP-6",
  "Hexarelin",
  "Sermorelin",
  "Sermorelin + Ipamorelin (Blend)",
  "Tesamorelin",
  "Tesamorelin + Ipamorelin (Blend)",
  "AOD-9604",
  "HGH Fragment 176-191",
  "MK-677 (Ibutamoren)",
  "HGH (Somatropin)",
  "IGF-1 LR3",
  "IGF-1 DES",
  "PEG-MGF",
  "MGF",

  // ── PEPTIDES: Weight Loss / GLP-1 ──
  "Semaglutide",
  "Tirzepatide",
  "Retatrutide",
  "Liraglutide",
  "Cagrilintide",
  "Semaglutide + Cagrilintide (CagriSema)",
  "Tesofensine",
  "AOD-9604 + Semaglutide (Blend)",

  // ── PEPTIDES: Cognitive / Nootropic ──
  "Semax",
  "Selank",
  "Dihexa",
  "P21",
  "Cerebrolysin",
  "NSI-189",
  "Pinealon",
  "DSIP (Delta Sleep-Inducing Peptide)",
  "MOTS-c",
  "Humanin",
  "SS-31 (Elamipretide)",

  // ── PEPTIDES: Sexual Health ──
  "PT-141 (Bremelanotide)",
  "Melanotan II",
  "Kisspeptin-10",

  // ── PEPTIDES: Cardiovascular / Misc ──
  "Angiotensin 1-7",
  "Thymosin Beta-4 Frag",
  "5-Amino-1MQ",

  // ── SARMs ──
  "Ostarine (MK-2866)",
  "Ligandrol (LGD-4033)",
  "RAD-140 (Testolone)",
  "Andarine (S4)",
  "Cardarine (GW-501516)",
  "Stenabolic (SR9009)",
  "YK-11",
  "S23",
  "LGD-3303",
  "AC-262 (Accadrine)",
  "ACP-105",
  "TLB-150 (Rad-150)",
  "LGD-4033 + RAD-140 (Blend)",
  "Ostarine + Cardarine (Blend)",

  // ── TESTOSTERONE (Injectable) ──
  "Testosterone Cypionate",
  "Testosterone Enanthate",
  "Testosterone Propionate",
  "Testosterone Undecanoate",
  "Testosterone Suspension",
  "Sustanon 250",

  // ── ANABOLIC STEROIDS (Injectable Oils) ──
  "Nandrolone Decanoate (Deca)",
  "Nandrolone Phenylpropionate (NPP)",
  "Trenbolone Acetate",
  "Trenbolone Enanthate",
  "Trenbolone Hexahydrobenzylcarbonate",
  "Masteron (Drostanolone Propionate)",
  "Masteron Enanthate (Drostanolone Enanthate)",
  "Primobolan (Methenolone Enanthate)",
  "Equipoise (Boldenone Undecylenate)",
  "Boldenone Propionate",
  "Parabolan",
  "EQ + Test Blend",
  "Test E + Deca (Blend)",
  "Supertest 450",

  // ── ANABOLIC STEROIDS (Orals) ──
  "Oxandrolone (Anavar)",
  "Stanozolol (Winstrol)",
  "Methandrostenolone (Dianabol)",
  "Oxymetholone (Anadrol)",
  "Halotestin",
  "Superdrol (Methasterone)",
  "Turinabol (4-Chlorodehydromethyltestosterone)",
  "Proviron (Mesterolone)",
  "Clenbuterol",
  "T3 (Liothyronine)",
  "T4 (Levothyroxine)",
  "Ephedrine",
  "Albuterol",
  "AICAR",
  "MK-677 (Oral)",

  // ── ANCILLARIES / AI / SERM ──
  "Anastrozole (Arimidex)",
  "Exemestane (Aromasin)",
  "Letrozole (Femara)",
  "Tamoxifen (Nolvadex)",
  "Clomiphene (Clomid)",
  "Raloxifene",
  "Enclomiphene",
  "hCG (Human Chorionic Gonadotropin)",
  "Kisspeptin-10 (LH stimulation)",

  // ── TRT / HRT ──
  "Testosterone Cypionate (TRT dose)",
  "Testosterone Enanthate (TRT dose)",
  "Testosterone Pellets",
  "DHEA",
  "Pregnenolone",
  "Progesterone",
  "Estradiol",

  // ── VITAMINS / MICRONUTRIENTS (Injectable) ──
  "Vitamin B12 (Methylcobalamin)",
  "Vitamin B12 (Cyanocobalamin)",
  "Vitamin D3 (Injectable)",
  "Glutathione (IV/IM)",
  "NAD+ (IV)",
  "Vitamin C (High Dose IV)",
  "Zinc Sulfate (Injectable)",
  "Magnesium Sulfate (Injectable)",

  // ── BACTERIOSTATIC / RECONSTITUTION ──
  "Bacteriostatic Water",
  "Sterile Saline (0.9%)",
];

// ─── STACK PRESETS ───────────────────────────────────────────────────────────
export type Compound = { name: string; mass_mg: number; unit: 'mg' | 'g' | 'IU' };

export interface StackPreset {
  id: string;
  label: string;
  emoji: string;
  category: string;
  description: string;
  compounds: Compound[];
}

export const STACK_PRESETS: StackPreset[] = [
  // ── RECOVERY ──
  {
    id: "wolverine",
    label: "Wolverine",
    emoji: "🐺",
    category: "Recovery",
    description: "BPC-157 + TB-500 — rapid tissue repair & anti-inflammatory",
    compounds: [
      { name: "BPC-157", mass_mg: 5, unit: "mg" },
      { name: "TB-500 (Thymosin Beta-4)", mass_mg: 5, unit: "mg" },
    ],
  },
  {
    id: "wolverine2",
    label: "Super Wolverine",
    emoji: "🐺🔥",
    category: "Recovery",
    description: "BPC-157 + TB-500 + GHK-Cu — max recovery trinity",
    compounds: [
      { name: "BPC-157", mass_mg: 5, unit: "mg" },
      { name: "TB-500 (Thymosin Beta-4)", mass_mg: 5, unit: "mg" },
      { name: "GHK-Cu", mass_mg: 2, unit: "mg" },
    ],
  },

  // ── MASS / BULKING ──
  {
    id: "beginner_bulk",
    label: "Beginner Bulk",
    emoji: "🏋️",
    category: "Mass",
    description: "Test E solo — classic first cycle",
    compounds: [
      { name: "Testosterone Enanthate", mass_mg: 500, unit: "mg" },
    ],
  },
  {
    id: "mass_builder",
    label: "Mass Builder",
    emoji: "💪",
    category: "Mass",
    description: "Test C + Deca — classic wet bulk with joint support",
    compounds: [
      { name: "Testosterone Cypionate", mass_mg: 400, unit: "mg" },
      { name: "Nandrolone Decanoate (Deca)", mass_mg: 300, unit: "mg" },
    ],
  },
  {
    id: "powerhouse",
    label: "Powerhouse",
    emoji: "🔨",
    category: "Mass",
    description: "Test E + Deca + Dianabol — the legendary golden era stack",
    compounds: [
      { name: "Testosterone Enanthate", mass_mg: 500, unit: "mg" },
      { name: "Nandrolone Decanoate (Deca)", mass_mg: 400, unit: "mg" },
      { name: "Methandrostenolone (Dianabol)", mass_mg: 30, unit: "mg" },
    ],
  },
  {
    id: "eq_bulk",
    label: "EQ Bulk",
    emoji: "🐴",
    category: "Mass",
    description: "Test E + Equipoise — lean mass, increased appetite, vascularity",
    compounds: [
      { name: "Testosterone Enanthate", mass_mg: 500, unit: "mg" },
      { name: "Equipoise (Boldenone Undecylenate)", mass_mg: 400, unit: "mg" },
    ],
  },
  {
    id: "test_npp",
    label: "Test + NPP",
    emoji: "💉",
    category: "Mass",
    description: "Test C + NPP — faster acting Deca alternative for lean mass",
    compounds: [
      { name: "Testosterone Cypionate", mass_mg: 400, unit: "mg" },
      { name: "Nandrolone Phenylpropionate (NPP)", mass_mg: 300, unit: "mg" },
    ],
  },
  {
    id: "sustanon_deca",
    label: "Sustanon + Deca",
    emoji: "🧬",
    category: "Mass",
    description: "Sustanon 250 + Nandrolone — old school mass stack",
    compounds: [
      { name: "Sustanon 250", mass_mg: 500, unit: "mg" },
      { name: "Nandrolone Decanoate (Deca)", mass_mg: 400, unit: "mg" },
    ],
  },
  {
    id: "lean_bulk_primo",
    label: "Lean Bulk (Primo)",
    emoji: "🥇",
    category: "Mass",
    description: "Test E + Primobolan — clean quality gains, mild androgenicity",
    compounds: [
      { name: "Testosterone Enanthate", mass_mg: 400, unit: "mg" },
      { name: "Primobolan (Methenolone Enanthate)", mass_mg: 600, unit: "mg" },
    ],
  },
  {
    id: "anadrol_bulk",
    label: "Anadrol Blast",
    emoji: "💣",
    category: "Mass",
    description: "Test C + Anadrol kickstart — rapid strength & size",
    compounds: [
      { name: "Testosterone Cypionate", mass_mg: 500, unit: "mg" },
      { name: "Oxymetholone (Anadrol)", mass_mg: 50, unit: "mg" },
    ],
  },

  // ── CUTTING / SHREDDING ──
  {
    id: "shredding",
    label: "Shredding",
    emoji: "🔥",
    category: "Cut",
    description: "Tirzepatide + AOD-9604 — dual GLP-1 fat shred",
    compounds: [
      { name: "Tirzepatide", mass_mg: 5, unit: "mg" },
      { name: "AOD-9604", mass_mg: 2, unit: "mg" },
    ],
  },
  {
    id: "sema_aod",
    label: "Sema + AOD",
    emoji: "💊",
    category: "Cut",
    description: "Semaglutide + AOD-9604 — GLP-1 powered fat loss",
    compounds: [
      { name: "Semaglutide", mass_mg: 1, unit: "mg" },
      { name: "AOD-9604", mass_mg: 2, unit: "mg" },
    ],
  },
  {
    id: "ultra_shred",
    label: "Ultra Shred",
    emoji: "🌡️",
    category: "Cut",
    description: "Tirzepatide + Tesofensine + HGH Frag — aggressive fat loss",
    compounds: [
      { name: "Tirzepatide", mass_mg: 5, unit: "mg" },
      { name: "Tesofensine", mass_mg: 0.5, unit: "mg" },
      { name: "HGH Fragment 176-191", mass_mg: 2, unit: "mg" },
    ],
  },
  {
    id: "classic_cut",
    label: "Classic Cut",
    emoji: "✂️",
    category: "Cut",
    description: "Test P + Anavar + Winstrol — contest prep stack",
    compounds: [
      { name: "Testosterone Propionate", mass_mg: 100, unit: "mg" },
      { name: "Oxandrolone (Anavar)", mass_mg: 50, unit: "mg" },
      { name: "Stanozolol (Winstrol)", mass_mg: 50, unit: "mg" },
    ],
  },
  {
    id: "tren_cut",
    label: "Tren Cut",
    emoji: "🐅",
    category: "Cut",
    description: "Test P + Tren A + Masteron — hard, dry, vascular look",
    compounds: [
      { name: "Testosterone Propionate", mass_mg: 100, unit: "mg" },
      { name: "Trenbolone Acetate", mass_mg: 100, unit: "mg" },
      { name: "Masteron (Drostanolone Propionate)", mass_mg: 100, unit: "mg" },
    ],
  },
  {
    id: "recomp",
    label: "Recomp",
    emoji: "⚖️",
    category: "Cut",
    description: "Test E + Primobolan + Anavar — recomp / body transformation",
    compounds: [
      { name: "Testosterone Enanthate", mass_mg: 300, unit: "mg" },
      { name: "Primobolan (Methenolone Enanthate)", mass_mg: 500, unit: "mg" },
      { name: "Oxandrolone (Anavar)", mass_mg: 40, unit: "mg" },
    ],
  },

  // ── GH / PEPTIDE STACKS ──
  {
    id: "gh_stack",
    label: "GH Stack",
    emoji: "📈",
    category: "GH / Peptides",
    description: "CJC-1295 + Ipamorelin — pulsatile GH release, anti-aging",
    compounds: [
      { name: "CJC-1295 (No DAC / Mod GRF 1-29)", mass_mg: 1, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 1, unit: "mg" },
    ],
  },
  {
    id: "gh_stack_dac",
    label: "GH Mega Stack",
    emoji: "📈🔥",
    category: "GH / Peptides",
    description: "CJC-1295 DAC + Ipamorelin — sustained GH elevation",
    compounds: [
      { name: "CJC-1295 (with DAC)", mass_mg: 2, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 1, unit: "mg" },
    ],
  },
  {
    id: "tesamorelin_ipa",
    label: "Tesa Stack",
    emoji: "🎯",
    category: "GH / Peptides",
    description: "Tesamorelin + Ipamorelin — visceral fat + GH release",
    compounds: [
      { name: "Tesamorelin", mass_mg: 2, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 0.3, unit: "mg" },
    ],
  },
  {
    id: "igf_combo",
    label: "IGF Combo",
    emoji: "🧬",
    category: "GH / Peptides",
    description: "CJC-1295 + Ipamorelin + IGF-1 LR3 — max anabolic signaling",
    compounds: [
      { name: "CJC-1295 (No DAC / Mod GRF 1-29)", mass_mg: 1, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 1, unit: "mg" },
      { name: "IGF-1 LR3", mass_mg: 0.1, unit: "mg" },
    ],
  },
  {
    id: "5_amino",
    label: "5-Amino GH",
    emoji: "🧠",
    category: "GH / Peptides",
    description: "5-Amino-1MQ + CJC-1295 + Ipamorelin — longevity + lean mass",
    compounds: [
      { name: "5-Amino-1MQ", mass_mg: 50, unit: "mg" },
      { name: "CJC-1295 (No DAC / Mod GRF 1-29)", mass_mg: 1, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 1, unit: "mg" },
    ],
  },

  // ── SARMs ──
  {
    id: "sarms_bulk",
    label: "SARMs Bulk",
    emoji: "🔬",
    category: "SARMs",
    description: "RAD-140 + LGD-4033 + MK-677 — lean mass",
    compounds: [
      { name: "RAD-140 (Testolone)", mass_mg: 10, unit: "mg" },
      { name: "Ligandrol (LGD-4033)", mass_mg: 10, unit: "mg" },
      { name: "MK-677 (Ibutamoren)", mass_mg: 25, unit: "mg" },
    ],
  },
  {
    id: "sarms_cut",
    label: "SARMs Cut",
    emoji: "♟️",
    category: "SARMs",
    description: "Ostarine + Cardarine + Andarine — fat loss + muscle retention",
    compounds: [
      { name: "Ostarine (MK-2866)", mass_mg: 20, unit: "mg" },
      { name: "Cardarine (GW-501516)", mass_mg: 10, unit: "mg" },
      { name: "Andarine (S4)", mass_mg: 25, unit: "mg" },
    ],
  },
  {
    id: "sarms_quad",
    label: "SARMs Quad",
    emoji: "🃏",
    category: "SARMs",
    description: "Ostarine + LGD-4033 + RAD-140 + MK-677 — advanced lean bulk",
    compounds: [
      { name: "Ostarine (MK-2866)", mass_mg: 20, unit: "mg" },
      { name: "Ligandrol (LGD-4033)", mass_mg: 10, unit: "mg" },
      { name: "RAD-140 (Testolone)", mass_mg: 10, unit: "mg" },
      { name: "MK-677 (Ibutamoren)", mass_mg: 25, unit: "mg" },
    ],
  },
  {
    id: "yk11_rad",
    label: "YK-11 Blast",
    emoji: "💥",
    category: "SARMs",
    description: "YK-11 + RAD-140 — myostatin inhibition + mass",
    compounds: [
      { name: "YK-11", mass_mg: 10, unit: "mg" },
      { name: "RAD-140 (Testolone)", mass_mg: 10, unit: "mg" },
    ],
  },
  {
    id: "sarms_endurance",
    label: "SARMs Endurance",
    emoji: "🏃",
    category: "SARMs",
    description: "Cardarine + Stenabolic + Ostarine — endurance + recovery",
    compounds: [
      { name: "Cardarine (GW-501516)", mass_mg: 10, unit: "mg" },
      { name: "Stenabolic (SR9009)", mass_mg: 20, unit: "mg" },
      { name: "Ostarine (MK-2866)", mass_mg: 20, unit: "mg" },
    ],
  },

  // ── TRT ──
  {
    id: "trt",
    label: "TRT Protocol",
    emoji: "🔄",
    category: "TRT",
    description: "Test C + hCG — standard TRT with fertility support",
    compounds: [
      { name: "Testosterone Cypionate", mass_mg: 150, unit: "mg" },
      { name: "hCG (Human Chorionic Gonadotropin)", mass_mg: 500, unit: "IU" },
    ],
  },
  {
    id: "trt_ai",
    label: "TRT + AI",
    emoji: "⚕️",
    category: "TRT",
    description: "Test C + hCG + Anastrozole — TRT with estrogen management",
    compounds: [
      { name: "Testosterone Cypionate", mass_mg: 150, unit: "mg" },
      { name: "hCG (Human Chorionic Gonadotropin)", mass_mg: 500, unit: "IU" },
      { name: "Anastrozole (Arimidex)", mass_mg: 0.5, unit: "mg" },
    ],
  },

  // ── LONGEVITY ──
  {
    id: "longevity",
    label: "Longevity",
    emoji: "♾️",
    category: "Longevity",
    description: "Epitalon + MOTS-c — cellular rejuvenation & mitochondrial health",
    compounds: [
      { name: "Epitalon", mass_mg: 10, unit: "mg" },
      { name: "MOTS-c", mass_mg: 5, unit: "mg" },
    ],
  },
  {
    id: "mito_stack",
    label: "Mito Stack",
    emoji: "⚡",
    category: "Longevity",
    description: "SS-31 + Humanin + MOTS-c — mitochondrial & metabolic health",
    compounds: [
      { name: "SS-31 (Elamipretide)", mass_mg: 10, unit: "mg" },
      { name: "MOTS-c", mass_mg: 5, unit: "mg" },
    ],
  },
  {
    id: "nad_stack",
    label: "NAD+ Boost",
    emoji: "🔋",
    category: "Longevity",
    description: "5-Amino-1MQ + NAD+ — NAD+ elevation for cellular energy",
    compounds: [
      { name: "5-Amino-1MQ", mass_mg: 50, unit: "mg" },
      { name: "NAD+ (IV)", mass_mg: 500, unit: "mg" },
    ],
  },

  // ── COGNITIVE ──
  {
    id: "brain_stack",
    label: "Brain Stack",
    emoji: "🧠",
    category: "Cognitive",
    description: "Semax + Selank — focus + anxiolytic neuropeptide combo",
    compounds: [
      { name: "Semax", mass_mg: 0.6, unit: "mg" },
      { name: "Selank", mass_mg: 0.25, unit: "mg" },
    ],
  },
  {
    id: "nootropic_gh",
    label: "Nootropic GH",
    emoji: "📡",
    category: "Cognitive",
    description: "Semax + CJC-1295 + Ipamorelin — cognitive edge + GH pulse",
    compounds: [
      { name: "Semax", mass_mg: 0.6, unit: "mg" },
      { name: "CJC-1295 (No DAC / Mod GRF 1-29)", mass_mg: 1, unit: "mg" },
      { name: "Ipamorelin", mass_mg: 1, unit: "mg" },
    ],
  },
];
