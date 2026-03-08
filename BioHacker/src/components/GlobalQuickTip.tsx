"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const QUICK_TIPS = [
  "Tap the edit icon next to any upcoming dose on your Pin Schedule to jump straight to fixing that compound's protocol.",
  "Run an Audit on your Gear Stash items instead of rapidly adding/subtracting them to ensure pharmacy-level accuracy.",
  "When adding compounds, you don't need to scroll. Just start typing, and the auto-complete engine will find it—or let you save a completely custom name.",
  "You can now set exactly how much BAC Water you used for a liquid vial so you never forget your concentration ratio.",
  "Don't worry about mental math. The strict BioTracker math engine will flawlessly convert mcg, mg, and g dosages to IU on a standard 1mL syringe.",
  "The Wellbeing Journal tracks mood, energy, sleep, and soreness to spot explicitly working compounds.",
  "To skip weekends for a protocol, tap the calendar icon on a vial and toggle it active.",
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
