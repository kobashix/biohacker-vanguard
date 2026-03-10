"use client";

import { useState } from "react";
import { HelpCircle, Calculator, Calendar, Shield, Syringe, Beaker, ChevronDown, ChevronUp, Zap, Clock, AlertTriangle, BookOpen } from "lucide-react";

interface Guide {
  title: string;
  icon: any;
  emoji: string;
  summary: string;
  tip: string;
  content: string[];
}

const GUIDES: Guide[] = [
  {
    title: "Reconstitution 101",
    icon: Calculator,
    emoji: "🧪",
    summary: "How to mix peptide powder into a solution using BAC water.",
    tip: "Use the Reconstitution Engine in the Cycle tab — enter your vial mg and desired concentration, it calculates BAC water volume automatically.",
    content: [
      "1. Draw up the amount of Bacteriostatic Water (BAC) you want into a syringe (e.g. 2mL for a 5mg vial).",
      "2. Inject the BAC slowly down the side of the vial — never directly onto the powder.",
      "3. Swirl gently. Never shake. Shaking denatures peptides.",
      "4. Let it sit 2–5 minutes until fully dissolved. Lyophilized peptides dissolve quickly.",
      "5. Example: 5mg vial + 2mL BAC = 2500mcg/mL. Draw 0.1mL (10 units on a U-100) = 250mcg per dose.",
      "6. Use the 'Mixed Liquid' form in the app to track exactly how much BAC Water you added.",
      "7. Store reconstituted peptides in the fridge (2–8°C). Most are stable 4–6 weeks refrigerated.",
      "💡 Track your vial's Remaining Estimates (%) directly inside its properties pane as you use it.",
    ],
  },
  {
    title: "Dosing Schedules",
    icon: Calendar,
    emoji: "📅",
    summary: "Setting up daily, weekly, and 'X on / Y off' schedules.",
    tip: "Set up a Schedule per vial in Stash — tap the calendar icon on any vial. The app calculates your next dose time automatically.",
    content: [
      "Daily: Log the same amount every day at the same time. Best for items like BPC-157 and TB-500.",
      "Weekly: For long-ester items (Test E, Test C, Deca) — typically split into 2 doses per week (Mon/Thu) to keep blood levels stable.",
      "X on / Y off: Common for items like Ipamorelin/CJC — e.g. 5 days on, 2 days off to preserve sensitivity.",
      "Skip Weekends: Useful for lifestyle convenience with daily items that aren't time-critical.",
      "Time of day matters: GH items (Ipamorelin, CJC-1295) are most effective fasted — first thing in the morning or before bed.",
      "BPC-157 & TB-500 can be logged subcutaneously near the injury site for localized effects.",
      "💡 See a dose on your Schedule that needs tweaking? Tap the Edit icon directly on the calendar to jump straight to the compound settings.",
    ],
  },
  {
    title: "Injection Sites",
    icon: Syringe,
    emoji: "📍",
    summary: "Where and how to log safely for different compound types.",
    tip: "Log your injection site on every dose — the app tracks site frequency so you can rotate properly and avoid scar tissue.",
    content: [
      "Subcutaneous (SubQ): Belly fat, love handle, or outer thigh. Best for items and small volume (< 0.5mL) insulin-syringe doses.",
      "Intramuscular (IM): Glute (ventroglute is safest), quad (vastus lateralis), or delt. Required for oil-based items.",
      "Ventroglute: Recommended for most IM injections. Find it by placing your palm on the hip bone — inject in the 'V' between your index and middle finger.",
      "Rotate sites every dose to prevent scar tissue buildup (PIP / post-injection pain).",
      "SubQ doses for items should use a 29–31 gauge insulin syringe. Virtually painless.",
      "IM oil injections: 23–25 gauge, 1–1.5 inch needle. Warm the oil briefly before drawing to reduce viscosity.",
      "Log your injection site in the Log Pin form — the app tracks frequency per site to help you rotate.",
    ],
  },
  {
    title: "Stack Schedules",
    icon: Beaker,
    emoji: "🧬",
    summary: "How to run common stacks and what to watch for.",
    tip: "Use Stash → Add Compound and pick a preset (e.g. Wolverine, GH Stack, TRT Schedule) to auto-fill all compounds and starting doses.",
    content: [
      "Wolverine Stack (BPC-157 + TB-500): Run 10mg/week total (5mg each) for 4–8 weeks for injury repair. Taper to 5mg/week for maintenance.",
      "GH Stack (CJC-1295 No DAC + Ipamorelin): 1-2x daily, separated from carb meals. Ideal time: fasted AM + before sleep.",
      "GLP-1 (Semaglutide/Tirzepatide): Start at 0.25mg/week and titrate up slowly every 4 weeks. Watch for nausea at dose escalations.",
      "TRT Schedule: Testosterone Cypionate 150–200mg/week split into 2 doses. Add hCG 500IU 2x/week to maintain testicular function.",
      "Bulking Stack: Test E/C 400–500mg/week backbone. Add Deca or NPP if joints need support. Kickstart with oral items (30mg/day) for 4 weeks.",
      "Cutting Stack: Lower Test to 200–300mg cruise. Add hardening items for the final 6–8 weeks.",
      "⚠️ Always run bloodwork before starting and 4–6 weeks into a cycle. Track CBC, CMP, lipids, and hormone panels.",
    ],
  },
  {
    title: "App Quick-Start",
    icon: Clock,
    emoji: "⚡",
    summary: "Get up and running in 5 minutes.",
    tip: "Go to More → Settings and tap 'Add Demo Data' to instantly populate the app with 30 days of realistic sample data.",
    content: [
      "Step 1: Go to Inventory → Add Compound. You can simply type a custom name, or let the auto-complete suggest one.",
      "Step 2: Note the unit. BioTracker strictly supports mg, mcg, g, IU, and pills across the completely rewritten U100 Math Engine.",
      "Step 3: Hit the Schedule (calendar) icon to set up your schedule and preferred dose unit.",
      "Step 4: Once doses are taken, tap the vial icon OR the calendar dose directly, hit 'Log Dose', and save.",
      "Step 5: For liquids, you can adjust the Remaining Est (%) slider to visually track how deep into the vial you are.",
      "Step 6: Each morning, swipe to the Pump & Recovery section and log your daily check-in (mood, energy, sleep).",
      "Step 7: Keep your Inventory Stash perfectly accurate. Tapping 'Audit' allows you to do full precision counts of your physical stock.",
    ],
  },
  {
    title: "Safety & Storage",
    icon: AlertTriangle,
    emoji: "🛡️",
    summary: "How to store compounds and stay safe.",
    tip: "Track your supplies and items in Inventory Stash (Stash → Inventory) so you're never caught short before a dose.",
    content: [
      "Unreconstituted lyophilized peptides: Store in a cool, dry place (or freezer for long-term). Good for 12–24 months frozen.",
      "Reconstituted peptides: Refrigerate at 2–8°C. Good for 4–6 weeks. Never freeze after adding BAC water.",
      "Oil-based steroids: Room temperature away from light is fine. Do NOT refrigerate — oil thickens and becomes hard to draw.",
      "Use sterile technique: Wipe vial tops and injection sites with an alcohol swab each time.",
      "Change needles: Never reuse a needle. Use one to draw, replace with a fresh one to dose.",
      "Data Safety: The Inventory Stash requires double-confirmation to delete items, preventing you from losing cash-equivalent counts to a stray tap.",
      "⚠️ If you notice cloudiness, particulate matter, or crystallization in a solution — discard it immediately.",
    ],
  },
];

const QUICK_TIPS = [
  "Tap the edit icon next to any upcoming dose on your Schedule to jump straight to fixing that compound's schedule.",
  "Run an Audit on your Inventory Stash items instead of rapidly adding/subtracting them to ensure accuracy.",
  "When adding compounds, you don't need to scroll. Just start typing, and the auto-complete engine will find it—or let you save a completely custom name.",
  "You can now set exactly how much BAC Water you used for a liquid vial so you never forget your concentration ratio.",
  "Don't worry about mental math. The strict BioTracker math engine will flawlessly convert mcg, mg, and g dosages to IU on a standard 1mL syringe.",
  "The Wellbeing Journal tracks mood, energy, sleep, and soreness — great for spotting when a compound is actually working.",
];

export function HelpGuides() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [tipIndex] = useState(() => Math.floor(Math.random() * QUICK_TIPS.length));

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <BookOpen className="h-5 w-5 text-primary" /> Knowledge Base
        </h3>
        <p className="card-description">Guides for schedules, stacks, and daily use.</p>
      </div>
      <div className="card-content">
        {/* Accordion guides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {GUIDES.map((g, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? '#18181b' : '#0f0f10',
                  border: `1px solid ${isOpen ? '#2563eb' : '#27272a'}`,
                  borderRadius: '0.875rem',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Header row */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{g.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fafafa' }}>{g.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.summary}</p>
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronUp style={{ width: '1rem', height: '1rem', color: '#2563eb', flexShrink: 0 }} />
                    : <ChevronDown style={{ width: '1rem', height: '1rem', color: '#3f3f46', flexShrink: 0 }} />
                  }
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 1rem 1rem' }}>
                    <div style={{ borderTop: '1px solid #27272a', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Per-guide quick tip at the top */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '0.625rem', padding: '0.625rem 0.75rem', marginBottom: '0.375rem' }}>
                        <Zap style={{ width: '0.8rem', height: '0.8rem', color: '#f59e0b', flexShrink: 0, marginTop: '0.1rem' }} />
                        <p style={{ fontSize: '0.775rem', color: '#fbbf24', lineHeight: 1.5, margin: 0 }}>{g.tip}</p>
                      </div>
                      {g.content.map((line, li) => (
                        <p
                          key={li}
                          style={{
                            fontSize: '0.8rem',
                            lineHeight: 1.6,
                            color: line.startsWith('⚠️') ? '#ef4444' : line.startsWith('💡') ? '#60a5fa' : '#d4d4d8',
                            background: line.startsWith('⚠️') ? 'rgba(239,68,68,0.06)' : line.startsWith('💡') ? 'rgba(37,99,235,0.06)' : 'none',
                            padding: (line.startsWith('⚠️') || line.startsWith('💡')) ? '0.5rem 0.625rem' : '0',
                            borderRadius: '0.5rem',
                            borderLeft: line.startsWith('⚠️') ? '3px solid #ef4444' : line.startsWith('💡') ? '3px solid #2563eb' : 'none',
                          }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick tip */}
        <div style={{ borderTop: '1px solid #27272a', paddingTop: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <Zap style={{ width: '0.75rem', height: '0.75rem', color: '#f59e0b' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f59e0b' }}>Quick Tip</span>
          </div>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#a1a1aa', lineHeight: 1.5, background: 'rgba(245,158,11,0.05)', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #f59e0b' }}>
            {QUICK_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
