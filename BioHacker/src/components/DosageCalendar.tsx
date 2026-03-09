"use client";

import { useMemo, useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Activity, Settings, Clock, Plus } from "lucide-react";
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
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-xl font-black tracking-tight">
            {format(days[0], 'MMM d')} – {format(days[6], 'MMM d')}
          </h3>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)] transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)] transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Day chip selector ── */}
      <div className="grid grid-cols-7 gap-3">
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
              className={`
                flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border-2 relative
                ${isSelected
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                  : isToday
                    ? "bg-[var(--muted)] border-[var(--primary)]/20 text-[var(--foreground)]"
                    : "bg-[var(--muted)]/50 border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:border-[var(--border)]"}
              `}
            >
              <span className={`text-[10px] font-black uppercase tracking-wider opacity-60`}>{format(day, 'EEE')}</span>
              <span className={`text-xl font-black tracking-tight`}>
                {format(day, 'd')}
              </span>
              {/* Status Indicator */}
              {hasPin && (
                <div className={`
                  w-1.5 h-1.5 rounded-full
                  ${isSelected
                    ? 'bg-white'
                    : doneCount === doses.length ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Dose Detail List ── */}
      <div className="space-y-6 pt-2">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {format(selectedDay, 'EEEE, MMMM d')}
            </span>
            {isSameDay(selectedDay, new Date()) && (
              <span className="text-[10px] bg-[var(--primary-muted)] text-[var(--primary)] px-2.5 py-0.5 rounded-full font-black uppercase">Today</span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider opacity-60">
            {selectedDoses.length} {selectedDoses.length === 1 ? 'Scheduled' : 'Scheduled'}
          </span>
        </div>

        {selectedDoses.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-[var(--muted)]/30 rounded-[var(--radius)] text-center">
            <Activity className="h-8 w-8 mb-3 text-[var(--muted-foreground)] opacity-40" />
            <span className="text-xs font-bold text-[var(--muted-foreground)] opacity-60">No protocols scheduled for this window.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDoses.map((dose, idx) => (
              <div
                key={idx}
                onClick={() => onSelectVial(dose.vialId)}
                className={`
                  group flex items-center gap-4 p-5 rounded-2xl transition-all cursor-pointer border-2
                  ${dose.completed
                    ? "bg-[var(--success)]/5 border-[var(--success)]/20"
                    : "bg-[var(--card)] border-transparent shadow-sm hover:border-[var(--primary)]/30 hover:shadow-md"}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${dose.completed
                    ? 'bg-[var(--success)] text-white shadow-lg shadow-[var(--success)]/20'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--primary-muted)] group-hover:text-[var(--primary)]'}
                `}>
                  {dose.completed ? <CheckCircle2 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg tracking-tight text-[var(--foreground)] truncate">
                    {dose.name}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-3 w-3" /> {dose.time} • {dose.amount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {dose.completed ? (
                    <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-widest bg-[var(--success)]/10 px-3 py-1 rounded-full">Logged</span>
                  ) : (
                    <div className="flex gap-2">
                      {onEditVial && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditVial(dose.vialId); }}
                          className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--foreground)] hover:text-white transition-all sm:opacity-0 group-hover:opacity-100"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      )}
                      <button className="btn btn-primary !p-2 !rounded-xl">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
