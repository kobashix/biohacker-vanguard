"use client";

import { Info, HelpCircle, Shield, Zap, Calculator, Calendar } from "lucide-react";

export function HelpGuides() {
  const guides = [
    {
      title: "Reconstitution 101",
      icon: Calculator,
      description: "Learn how to use BAC water to mix your peptide powders with clinical precision.",
      link: "#"
    },
    {
      title: "Setting Up Protocols",
      icon: Calendar,
      description: "How to configure 'X days on / Y days off' and 'Skip Weekends' for your cycle.",
      link: "#"
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      description: "Understanding Zero-Knowledge encryption and multi-device synchronization.",
      link: "#"
    }
  ];

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h3 className="card-title text-primary flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Knowledge Base</h3>
          <p className="card-description">Guides and technical tools for precision tracking.</p>
        </div>
      </div>
      <div className="card-content space-y-4">
        {guides.map((g, i) => (
          <div key={i} className="group p-3 border border-border rounded-lg hover:border-primary transition-all cursor-pointer bg-muted/5">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <g.icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{g.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-snug">{g.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-2">
            <Zap className="h-3 w-3" /> System Quick-Tip
          </div>
          <p className="text-[11px] italic text-muted-foreground bg-primary/5 p-2 rounded border-l-2 border-primary">
            "You can log a dose directly from the Weekly Calendar by tapping on an upcoming slot. The math engine will pre-fill your protocol dose automatically."
          </p>
        </div>
      </div>
    </div>
  );
}
