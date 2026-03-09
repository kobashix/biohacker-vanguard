"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, SubjectiveLog } from "@/replicache";
import { format, formatDistanceToNow } from "date-fns";
import { Download, Syringe, Heart, Smile, Zap, Moon, Activity, BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function ScoreBar({ value, color, icon: Icon, label }: { value: number; color: string; icon: any; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <Icon style={{ width: '0.875rem', height: '0.875rem', color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a1a1aa', width: '52px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 800, color, width: '20px', textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  );
}

function WellbeingCard({ entry }: { entry: SubjectiveLog }) {
  const score = Math.round((entry.mood + entry.energy + entry.sleep_quality + (10 - entry.soreness)) / 4);
  const scoreColor = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 8 ? '🔥 Crushing It' : score >= 6 ? '💪 Solid' : score >= 4 ? '😐 Getting By' : '😴 Low';

  return (
    <div style={{
      background: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '1rem',
      padding: '1rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{format(entry.timestamp, 'EEEE, MMM d')}</p>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}<span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>/10</span></p>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: scoreColor }}>{scoreLabel}</p>
        </div>
      </div>

      <ScoreBar value={entry.mood} color="#10b981" icon={Smile} label="Mood" />
      <ScoreBar value={entry.energy} color="#f59e0b" icon={Zap} label="Energy" />
      <ScoreBar value={entry.sleep_quality} color="#6366f1" icon={Moon} label="Sleep" />
      <ScoreBar value={entry.soreness} color="#ef4444" icon={Activity} label="Soreness" />

      {entry.notes && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#09090b', borderRadius: '0.625rem', borderLeft: `3px solid ${scoreColor}` }}>
          <p style={{ fontSize: '0.85rem', color: '#d4d4d8', lineHeight: 1.5 }}>{entry.notes}</p>
        </div>
      )}
    </div>
  );
}

function HistoryContent() {
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'doses';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const rep = getReplicache(user?.id);
  const doseLogs = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "log/" }).values().toArray();
    return (list as DoseLog[]).sort((a, b) => b.timestamp - a.timestamp);
  }, { default: [] });

  const subjectiveLogs = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "subjective/" }).values().toArray();
    return (list as SubjectiveLog[]).sort((a, b) => b.timestamp - a.timestamp);
  }, { default: [] });

  const exportToCSV = () => {
    const headers = ["Timestamp", "Type", "Substance/Mood", "Amount/Energy", "Site/Sleep", "Notes"];
    const rows = [
      ...doseLogs.map((l: any) => [format(l.timestamp, 'yyyy-MM-dd HH:mm'), "Pin", l.substance, `${l.dose_amount} ${l.unit}`, l.injection_site || "N/A", ""]),
      ...subjectiveLogs.map((s: any) => [format(s.timestamp, 'yyyy-MM-dd HH:mm'), "Recovery", `Mood:${s.mood}`, `Energy:${s.energy}`, `Sleep:${s.sleep_quality}`, s.notes || ""]),
    ];
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `biohacker_history_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1 }}>Cycle History</h1>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa', marginTop: '0.25rem' }}>All pins, doses, and recovery journal entries.</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Download className="h-4 w-4" /> CSV
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#18181b', padding: '0.375rem', borderRadius: '0.875rem', border: '1px solid #27272a' }}>
        <button
          onClick={() => router.push('/dashboard/history?view=doses')}
          style={{
            padding: '0.75rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: view === 'doses' ? '#27272a' : 'transparent',
            color: view === 'doses' ? '#fafafa' : '#a1a1aa',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Syringe className="h-4 w-4" /> Dose Pins
        </button>
        <button
          onClick={() => router.push('/dashboard/history?view=wellbeing')}
          style={{
            padding: '0.75rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: view === 'wellbeing' ? '#27272a' : 'transparent',
            color: view === 'wellbeing' ? '#fafafa' : '#a1a1aa',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Heart className="h-4 w-4" /> Wellbeing Journal
        </button>
      </div>

      {/* Dose Pins View */}
      {view === 'doses' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Compound</th>
                  <th>Dose</th>
                  <th>Site</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doseLogs.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#a1a1aa' }}>No pins logged yet.</td></tr>
                )}
                {doseLogs.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="text-xs font-mono">{format(item.timestamp, 'MMM d, h:mm a')}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.substance}</td>
                    <td style={{ color: '#2563eb', fontWeight: 700 }}>{item.dose_amount} {item.unit}</td>
                    <td style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{item.injection_site || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete this log entry for ${item.substance}?`)) {
                            await rep?.mutate.deleteDoseLog(item.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-white transition-all border-none cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wellbeing Journal View */}
      {view === 'wellbeing' && (
        <div>
          {subjectiveLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#18181b', borderRadius: '1rem', border: '1px solid #27272a' }}>
              <BookOpen style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: '#27272a' }} />
              <p style={{ fontWeight: 700, color: '#a1a1aa' }}>No journal entries yet</p>
              <p style={{ fontSize: '0.875rem', color: '#3f3f46', marginTop: '0.25rem' }}>Log your daily Pump & Recovery check-in from the Home tab</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '1rem', fontWeight: 600 }}>
                {subjectiveLogs.length} {subjectiveLogs.length === 1 ? 'entry' : 'entries'} total
              </p>
              {subjectiveLogs.map((entry: any, idx: number) => (
                <WellbeingCard key={idx} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>Loading history...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
