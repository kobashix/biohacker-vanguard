"use client";

import { useState } from "react";
import { HelpCircle, Calculator, Calendar, Shield, Syringe, Beaker, ChevronDown, ChevronUp, Zap, Clock, AlertTriangle, BookOpen } from "lucide-react";

interface Guide {
  title: string;
  icon: any;
  emoji: string;
  summary: string;
  content: string[];
}

const GUIDES: Guide[] = [
  {
    title: "Reconstitution 101",
    icon: Calculator,
    emoji: "🧪",
    summary: "How to mix peptide powder into a solution using BAC water.",
    content: [
      "1. Draw up the amount of Bacteriostatic Water (BAC) you want into a syringe (e.g. 2mL for a 5mg vial).",
      "2. Inject the BAC slowly down the side of the vial — never directly onto the powder.",
      "3. Swirl gently. Never shake. Shaking denatures peptides.",
      "4. Let it sit 2–5 minutes until fully dissolved. Lyophilized peptides dissolve quickly.",
      "5. Example: 5mg vial + 2mL BAC = 2500mcg/mL. Draw 0.1mL (10 units on a U-100) = 250mcg per dose.",
      "6. Store reconstituted peptides in the fridge (2–8°C). Most are stable 4–6 weeks refrigerated.",
      "💡 Use the Reconstitution Engine in the Cycle tab to calculate your exact draw volumes automatically.",
    ],
  },
  {
    title: "Dosing Schedules",
    icon: Calendar,
    emoji: "📅",
    summary: "Setting up daily, weekly, and 'X on / Y off' protocols.",
    content: [
      "Daily: Pin the same amount every day at the same time. Best for peptides like BPC-157 and TB-500.",
      "Weekly: For long-ester steroids (Test E, Test C, Deca) — typically split into 2 injections per week (Mon/Thu) to keep blood levels stable.",
      "X on / Y off: Common for peptides like Ipamorelin/CJC — e.g. 5 days on, 2 days off to preserve receptor sensitivity.",
      "Skip Weekends: Useful for lifestyle convenience with daily peptides that aren't time-critical.",
      "Time of day matters: GH peptides (Ipamorelin, CJC-1295) are most effective fasted — first thing in the morning or before bed.",
      "BPC-157 & TB-500 can be pinned subcutaneously near the injury site for localized effects.",
      "💡 Set up a Protocol (Schedule) per vial under the Stash tab. The app will calculate future pins automatically.",
    ],
  },
  {
    title: "Injection Sites",
    icon: Syringe,
    emoji: "📍",
    summary: "Where and how to pin safely for different compound types.",
    content: [
      "Subcutaneous (SubQ): Belly fat, love handle, or outer thigh. Best for peptides and small volume (< 0.5mL) insulin-syringe pins.",
      "Intramuscular (IM): Glute (ventroglute is safest), quad (vastus lateralis), or delt. Required for oil-based steroids.",
      "Ventroglute: Recommended for most IM injections. Find it by placing your palm on the hip bone — inject in the 'V' between your index and middle finger.",
      "Rotate sites every pin to prevent scar tissue buildup (PIP / post-injection pain).",
      "SubQ pins for peptides should use a 29–31 gauge insulin syringe. Virtually painless.",
      "IM oil injections: 23–25 gauge, 1–1.5 inch needle. Warm the oil briefly before drawing to reduce viscosity.",
      "Log your injection site in the Log Pin form — the app tracks frequency per site to help you rotate.",
    ],
  },
  {
    title: "Stack Protocols",
    icon: Beaker,
    emoji: "🧬",
    summary: "How to run common stacks and what to watch for.",
    content: [
      "Wolverine Stack (BPC-157 + TB-500): Run 10mg/week total (5mg each) for 4–8 weeks for injury repair. Taper to 5mg/week for maintenance.",
      "GH Stack (CJC-1295 No DAC + Ipamorelin): 1-2x daily, separated from carb meals. Ideal time: fasted AM + before sleep.",
      "GLP-1 (Semaglutide/Tirzepatide): Start at 0.25mg/week and titrate up slowly every 4 weeks. Watch for nausea at dose escalations.",
      "TRT Protocol: Testosterone Cypionate 150–200mg/week split into 2 pins. Add hCG 500IU 2x/week to maintain testicular function.",
      "Bulking Stack: Test E/C 400–500mg/week backbone. Add Deca or NPP if joints need support. Kickstart with Dbol (30mg/day) for 4 weeks.",
      "Cutting Stack: Lower Test to 200–300mg cruise. Add Anavar or Winstrol for the final 6–8 weeks. Masteron controls estrogen and hardens.",
      "⚠️ Always run bloodwork before starting and 4–6 weeks into a cycle. Track CBC, CMP, lipids, and hormone panels.",
    ],
  },
  {
    title: "App Quick-Start",
    icon: Clock,
    emoji: "⚡",
    summary: "Get up and running in 5 minutes.",
    content: [
      "Step 1: Go to Stash → Add Compound. Select a preset stack or build custom vials.",
      "Step 2: For each vial, hit the Schedule (calendar) icon to set up your dosing protocol (frequency, dose, time of day).",
      "Step 3: Check the Home tab — Active Stacks shows what you're running. Pin Schedule shows your next pin.",
      "Step 4: After each pin, tap the vial and hit 'Log Pin'. Select your dose, site, and confirm.",
      "Step 5: Each morning, swipe to the Pump & Recovery section and log your daily check-in (mood, energy, sleep, soreness).",
      "Step 6: View your history anytime via Journal → Dose Pins or Wellbeing Journal.",
      "Step 7: The Reconstitution Engine under Cycle helps you calculate exactly how much BAC water to add to each vial.",
    ],
  },
  {
    title: "Safety & Storage",
    icon: AlertTriangle,
    emoji: "🛡️",
    summary: "How to store compounds and stay safe.",
    content: [
      "Unreconstituted lyophilized peptides: Store in a cool, dry place (or freezer for long-term). Good for 12–24 months frozen.",
      "Reconstituted peptides: Refrigerate at 2–8°C. Good for 4–6 weeks. Never freeze after adding BAC water.",
      "Oil-based steroids: Room temperature away from light is fine. Do NOT refrigerate — oil thickens and becomes hard to draw.",
      "Use sterile technique: Wipe vial tops and injection sites with an alcohol swab each time.",
      "Change needles: Never reuse a needle. Use one to draw, replace with a fresh one to inject.",
      "GLP-1s (Semaglutide etc.): Refrigerate at all times. Discard pens/vials after 28 days once opened.",
      "⚠️ If you notice cloudiness, particulate matter, or crystallization in a solution — discard it immediately.",
    ],
  },
];

const QUICK_TIPS = [
  "You can log a dose directly from the Pin Schedule by tapping an upcoming slot — it pre-fills your protocol dose.",
  "Set up your Gear Stash with needle counts so the app warns you when you're running low.",
  "The Wellbeing Journal tracks mood, energy, sleep, and soreness — great for spotting when a compound is actually working.",
  "Rotate your injection sites and track them in the Log Pin form to prevent scar tissue.",
  "GH peptides work best when injected fasted — first thing in the morning or right before sleep.",
  "Add Demo Data in Settings to see how the full app looks with filled charts and logs.",
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
        <p className="card-description">Guides for protocols, stacks, and daily use.</p>
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
