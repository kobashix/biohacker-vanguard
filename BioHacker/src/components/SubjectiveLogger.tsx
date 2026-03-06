"use client";

import { useState } from "react";
import { Smile, Zap, Moon, Activity, Save, Check } from "lucide-react";
import { getReplicache } from "@/replicache";
import { nanoid } from "nanoid";

export function SubjectiveLogger({ userId }: { userId: string }) {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [soreness, setSoreness] = useState(2);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const rep = getReplicache(userId);

  const handleSave = async () => {
    if (!rep) return;
    await rep.mutate.logSubjective({
      id: nanoid(),
      timestamp: Date.now(),
      mood,
      energy,
      sleep_quality: sleep,
      soreness,
      notes
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Slider = ({ label, icon: Icon, value, onChange, min = 1, max = 10, color = "var(--primary)" }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold uppercase text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3" style={{ color }} />
          {label}
        </div>
        <span>{value} / 10</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title"><Activity className="h-5 w-5 text-primary" /> Daily Wellbeing</h3>
        <p className="card-description">Track subjective response to your protocol</p>
      </div>
      <div className="card-content space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Slider label="Mood" icon={Smile} value={mood} onChange={setMood} color="#10b981" />
          <Slider label="Energy" icon={Zap} value={energy} onChange={setEnergy} color="#f59e0b" />
          <Slider label="Sleep Quality" icon={Moon} value={sleep} onChange={setSleep} color="#6366f1" />
          <Slider label="Physical Soreness" icon={Activity} value={soreness} onChange={setSoreness} color="#ef4444" />
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">Daily Notes (Symptoms, side effects, recovery status)</label>
          <textarea 
            className="form-input min-h-[80px] text-sm" 
            placeholder="e.g. Injection site slight redness, increased focus..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSave} 
          className={`btn w-full flex gap-2 ${saved ? 'btn-outline border-success text-success' : 'btn-primary'}`}
          disabled={saved}
        >
          {saved ? <><Check className="h-4 w-4" /> Entry Recorded</> : <><Save className="h-4 w-4" /> Save Wellbeing Log</>}
        </button>
      </div>
    </div>
  );
}
