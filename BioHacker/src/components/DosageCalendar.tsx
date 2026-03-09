"use client";

import { useMemo, useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, differenceInDays, startOfDay, endOfDay, isWeekend } from "date-fns";

interface DosageCalendarProps {
  userId: string;
  onSelectVial: (vialId: string) => void;
  onEditVial?: (vialId: string) => void;
}

export function DosageCalendar({ userId, onSelectVial, onEditVial }: DosageCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay()); // 0=Sun default to today
  const rep = getReplicache(userId);

  const logs = useSubscribe(rep, async (tx) => {
    return (await tx.scan({ prefix: "log/" }).values().toArray()) as DoseLog[];
  }, { default: [] });

  const protocols = useSubscribe(rep, async (tx) => {
    return (await tx.scan({ prefix: "protocol/" }).values().toArray()) as Protocol[];
  }, { default: [] });

  const vials = useSubscribe(rep, async (tx) => {
    return (await tx.scan({ prefix: "vial/" }).values().toArray()) as Vial[];
  }, { default: [] });

  const days = useMemo(() => {
    const start = startOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentWeek]);

  const getDosesForDay = (day: Date) => {
    const dailyDoses: any[] = [];
    const dayStart = startOfDay(day).getTime();
    const dayEnd = endOfDay(day).getTime();

    protocols.forEach(protocol => {
      const vial = vials.find(v => v.id === protocol.vial_id);
      if (!vial) return;
      if (protocol.skip_weekends && isWeekend(day)) return;

      const daysOn = protocol.days_on || 7;
      const daysOff = protocol.days_off || 0;
      const cycleLength = daysOn + daysOff;
      const protocolStart = new Date(protocol.start_time);
      const diffDays = differenceInDays(day, startOfDay(protocolStart));
      if (!(diffDays >= 0 && (diffDays % cycleLength) < daysOn)) return;

      const occurrences: number[] = [];
      const frequencyMs = protocol.frequency_hours * 3600000;

      if (protocol.time_buckets && protocol.time_buckets.length > 0) {
        protocol.time_buckets.forEach(bucket => {
          const occ = new Date(day);
          if (bucket === 'morning') occ.setHours(8, 0, 0, 0);
          else if (bucket === 'afternoon') occ.setHours(14, 0, 0, 0);
          else if (bucket === 'night') occ.setHours(20, 0, 0, 0);
          occurrences.push(occ.getTime());
        });
      } else {
        let occurrenceTime = protocolStart.getTime();
        while (occurrenceTime < dayStart) occurrenceTime += frequencyMs;
        while (occurrenceTime <= dayEnd) {
          occurrences.push(occurrenceTime);
          occurrenceTime += frequencyMs;
        }
      }

      occurrences.forEach(occTime => {
        const isCompleted = logs.some(l =>
          l.vial_id === vial.id && Math.abs(l.timestamp - occTime) < 7200000
        );
        let unit = 'mcg';
        if (vial.status === 'pill') unit = 'pills';
        else if (vial.compounds[0]?.unit === 'g') unit = 'mg';
        else if (vial.compounds[0]?.unit === 'IU') unit = 'IU';

        dailyDoses.push({
          vialId: vial.id,
          name: vial.name,
          amount: `${protocol.dose_amount} ${unit}`,
          completed: isCompleted,
          time: format(new Date(occTime), 'h:mm a'),
          rawTime: occTime,
        });
      });
    });

    return dailyDoses.sort((a, b) => a.rawTime - b.rawTime);
  };

  const selectedDay = days[selectedDayIndex] || days[0];
  const selectedDoses = getDosesForDay(selectedDay);

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="card-title"><CalendarIcon className="h-5 w-5 text-primary" /> Pin Schedule</h3>
          <p className="card-description">{format(days[0], 'MMM d')} – {format(days[6], 'MMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* ── Day pill selector (both mobile and desktop) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', padding: '0 0 0.75rem' }}>
        {days.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = i === selectedDayIndex;
          const doses = getDosesForDay(day);
          const doneCount = doses.filter(d => d.completed).length;
          const hasPin = doses.length > 0;

          return (
            <button
              key={i}
              onClick={() => setSelectedDayIndex(i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.5rem 0.25rem',
                borderRadius: '0.75rem',
                border: isSelected ? '1.5px solid #2563eb' : '1.5px solid transparent',
                background: isSelected ? 'rgba(37,99,235,0.12)' : isToday ? 'rgba(37,99,235,0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: isSelected ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {format(day, 'EEE')}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: isToday || isSelected ? 800 : 500, color: isSelected ? 'var(--primary)' : isToday ? 'var(--foreground)' : 'var(--muted-foreground)', lineHeight: 1 }}>
                {format(day, 'd')}
              </span>
              {/* Dot indicator */}
              {hasPin && (
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: doneCount === doses.length ? 'var(--success)' : 'var(--primary)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Selected day detail ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>
            {format(selectedDay, 'EEEE, MMMM d')}
            {isSameDay(selectedDay, new Date()) && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '99px', padding: '0.1rem 0.5rem', fontWeight: 700 }}>TODAY</span>
            )}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
            {selectedDoses.length > 0 ? `${selectedDoses.filter(d => d.completed).length}/${selectedDoses.length} done` : 'Rest day'}
          </span>
        </div>

        {selectedDoses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
            🛌 No pins scheduled — rest day
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedDoses.map((dose, idx) => (
                <div
                key={idx}
                onClick={() => onSelectVial(dose.vialId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${dose.completed ? 'var(--success)' : 'var(--border)'}`,
                  background: dose.completed ? 'rgba(16,185,129,0.07)' : 'var(--input-bg)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: dose.completed ? 'var(--success)' : 'var(--border)',
                  border: dose.completed ? 'none' : '2px solid var(--muted-foreground)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>
                    {dose.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.1rem' }}>
                    {dose.time} · {dose.amount}
                  </p>
                </div>
                {dose.completed && <CheckCircle2 style={{ width: '1.1rem', height: '1.1rem', color: 'var(--success)', flexShrink: 0 }} />}
                {!dose.completed && onEditVial && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEditVial(dose.vialId); }} 
                    style={{ padding: '0.25rem', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Edit Compound"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
