"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const QUICK_TIPS = [
  "You can log a dose directly from the Pin Schedule by tapping an upcoming slot.",
  "Set up your Gear in Inventory so the app warns you when you're running low.",
  "The Wellbeing Journal tracks mood, energy, sleep, and soreness to spot working compounds.",
  "Rotate your injection sites and track them to prevent scar tissue.",
  "GH peptides work best when injected fasted — AM or before sleep.",
  "Use the 'Perform Inventory' tool once a month to true-up your physical counts.",
  "To skip weekends for a protocol, tap the calendar icon on a vial and toggle it active.",
  "The Reconstitution Engine calculates exact draw volumes based on your syringe size.",
];

export function GlobalQuickTip() {
  const [tipIndex, setTipIndex] = useState(0);

  // Pick a random tip on mount
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * QUICK_TIPS.length));
  }, []);

  return (
    <div style={{ padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
      <Zap style={{ width: '0.9rem', height: '0.9rem', color: '#f59e0b', flexShrink: 0, marginTop: '0.1rem' }} />
      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#fbbf24', lineHeight: 1.4, margin: 0 }}>
        <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>Tip:</strong>
        {QUICK_TIPS[tipIndex]}
      </p>
    </div>
  );
}
