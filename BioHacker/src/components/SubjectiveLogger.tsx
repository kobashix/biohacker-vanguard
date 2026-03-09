"use client";

import { useState } from "react";
import { Smile, Zap, Moon, Activity, Save, Check, BookOpen, ChevronRight } from "lucide-react";
import { getReplicache } from "@/replicache";
import { useSubscribe } from "replicache-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function SubjectiveLogger({ userId }: { userId: string }) {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [soreness, setSoreness] = useState(2);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const rep = getReplicache(userId);

  // Subscribe to last entry for "last logged" display
  const lastEntry = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "subjective/" }).values().toArray() as any[];
    if (!list.length) return null;
    return list.sort((a, b) => b.timestamp - a.timestamp)[0];
  }, { default: null });

  const handleSave = async () => {
    if (!rep) return;
    await rep.mutate.logSubjective({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mood,
      energy,
      sleep_quality: sleep,
      soreness,
      notes
    });
    setSaved(true);
    setNotes("");
    setTimeout(() => setSaved(false), 3000);
  };

  const SliderRow = ({ label, icon: Icon, value, onChange, color }: any) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)' }}>
          <Icon style={{ width: '0.875rem', height: '0.875rem', color }} />
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Visual dot indicators */}
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '3px',
              background: i < value ? color : 'var(--border)',
              transition: 'background 0.1s',
            }} />
          ))}
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color, minWidth: '28px', textAlign: 'right' }}>{value}</span>
        </div>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
      />
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 className="card-title"><Activity className="h-5 w-5 text-primary" /> Pump & Recovery</h3>
            {lastEntry ? (
              <p className="card-description">
                Last logged {formatDistanceToNow(lastEntry.timestamp, { addSuffix: true })}
              </p>
            ) : (
              <p className="card-description">Track your daily physical response</p>
            )}
          </div>
          <Link
            href="/dashboard/history?view=wellbeing"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
              textDecoration: 'none', whiteSpace: 'nowrap',
              padding: '0.375rem 0.625rem',
              background: 'var(--primary-muted)',
              borderRadius: '0.5rem',
            }}
          >
            <BookOpen style={{ width: '0.875rem', height: '0.875rem' }} />
            View Journal
            <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
          </Link>
        </div>
      </div>
      <div className="card-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <SliderRow label="Mood" icon={Smile} value={mood} onChange={setMood} color="#10b981" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <SliderRow label="Energy / Pump" icon={Zap} value={energy} onChange={setEnergy} color="#f59e0b" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <SliderRow label="Sleep Quality" icon={Moon} value={sleep} onChange={setSleep} color="#6366f1" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <SliderRow label="Soreness (PIP)" icon={Activity} value={soreness} onChange={setSoreness} color="#ef4444" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label className="form-label">Notes (PIP, pump, sides, mood)</label>
          <textarea
            className="form-input"
            style={{ minHeight: '70px', fontSize: '0.9rem', lineHeight: 1.5 }}
            placeholder="How's the pump? Any PIP? Side effects?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className={`btn w-full flex gap-2 mt-2 ${saved ? 'btn-outline' : 'btn-primary'}`}
          disabled={saved}
          style={saved ? { borderColor: 'var(--success)', color: 'var(--success)' } : {}}
        >
          {saved ? <><Check className="h-4 w-4" /> Entry Recorded ✓</> : <><Save className="h-4 w-4" /> Log Check-In</>}
        </button>
      </div>
    </div>
  );
}
