"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const QUICK_TIPS = [
  "Tap the edit icon next to any upcoming dose on your Schedule to jump straight to fixing that compound's schedule.",
  "Run an Audit on your Inventory Stash items instead of rapidly adding/subtracting them to ensure accuracy.",
  "When adding compounds, you don't need to scroll. Just start typing, and the auto-complete engine will find it—or let you save a completely custom name.",
  "You can now set exactly how much BAC Water you used for a liquid vial so you never forget your concentration ratio.",
  "Don't worry about mental math. The strict BioTracker math engine will flawlessly convert mcg, mg, and g dosages to IU on a standard 1mL syringe.",
  "The Wellbeing Journal tracks mood, energy, sleep, and soreness to spot explicitly working compounds.",
  "To skip weekends for a schedule, tap the calendar icon on a vial and toggle it active.",
];

export function GlobalQuickTip() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * QUICK_TIPS.length));
  }, []);

  return (
    <div className="bg-amber-500/5 border-b border-amber-500/10 py-3 px-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="p-2 bg-amber-500/10 rounded-xl">
        <Zap className="h-4 w-4 text-amber-500" />
      </div>
      <p className="text-xs font-semibold text-amber-600/80 leading-relaxed italic">
        <span className="text-amber-600 font-black uppercase tracking-widest mr-2 not-italic text-[10px]">Optimization Tip:</span>
        {QUICK_TIPS[tipIndex]}
      </p>
    </div>
  );
}
