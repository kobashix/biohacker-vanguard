"use client";

import { useMemo, useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, differenceInDays, startOfDay, endOfDay, isWeekend, getHours } from "date-fns";

interface DosageCalendarProps {
  userId: string;
  onSelectVial: (vialId: string) => void;
}

export function DosageCalendar({ userId, onSelectVial }: DosageCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const rep = getReplicache(userId);

  const logs = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "log/" }).values().toArray();
    return list as DoseLog[];
  }, { default: [] });

  const protocols = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "protocol/" }).values().toArray();
    return list as Protocol[];
  }, { default: [] });

  const vials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
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

      // 1. Skip Weekends Check
      if (protocol.skip_weekends && isWeekend(day)) return;

      // 2. Days On/Off Cycle Check
      const daysOn = protocol.days_on || 7;
      const daysOff = protocol.days_off || 0;
      const cycleLength = daysOn + daysOff;
      const protocolStart = new Date(protocol.start_time);
      const diffDays = differenceInDays(day, startOfDay(protocolStart));
      const isDayOn = (diffDays >= 0) && (diffDays % cycleLength) < daysOn;
      if (!isDayOn) return;

      // 3. Time Bucket occurrences OR Frequency occurrences
      const occurrences: number[] = [];
      const frequencyMs = protocol.frequency_hours * 3600000;

      if (protocol.time_buckets && protocol.time_buckets.length > 0) {
        // Use discrete time buckets (Morning: 8am, Afternoon: 2pm, Night: 8pm)
        protocol.time_buckets.forEach(bucket => {
          const occ = new Date(day);
          if (bucket === 'morning') occ.setHours(8, 0, 0, 0);
          else if (bucket === 'afternoon') occ.setHours(14, 0, 0, 0);
          else if (bucket === 'night') occ.setHours(20, 0, 0, 0);
          occurrences.push(occ.getTime());
        });
      } else {
        // Use raw frequency
        let occurrenceTime = protocolStart.getTime();
        while (occurrenceTime < dayStart) occurrenceTime += frequencyMs;
        while (occurrenceTime <= dayEnd) {
          occurrences.push(occurrenceTime);
          occurrenceTime += frequencyMs;
        }
      }

      occurrences.forEach(occTime => {
        const isCompleted = logs.some(l => 
          l.vial_id === vial.id && 
          Math.abs(l.timestamp - occTime) < 7200000 // 2 hour grace period
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
          rawTime: occTime
        });
      });
    });

    return dailyDoses.sort((a, b) => a.rawTime - b.rawTime);
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h3 className="card-title"><CalendarIcon className="h-5 w-5 text-primary" /> Weekly Protocol</h3>
          <p className="card-description">Interactive schedule with advanced cycle logic</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronLeft className="h-4 w-4"/></button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronRight className="h-4 w-4"/></button>
        </div>
      </div>
      <div className="card-content p-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        <div className="grid grid-cols-7 min-w-[800px] border-t border-border">
          {days.map((day, i) => (
            <div key={i} className={`min-h-[140px] border-border snap-start snap-always ${i < 6 ? 'border-r' : ''} ${isWeekend(day) ? 'bg-muted/5' : ''}`}>
              <div className={`p-2 text-center border-b border-border ${isSameDay(day, new Date()) ? 'bg-primary/10' : 'bg-muted/10'}`}>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">{format(day, 'EEE')}</div>
                <div className="font-bold text-sm">{format(day, 'd')}</div>
              </div>
              <div className="p-2 space-y-2">
                {getDosesForDay(day).map((dose, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onSelectVial(dose.vialId)}
                    className={`p-2 rounded border cursor-pointer transition-all ${dose.completed ? 'bg-success/10 border-success' : 'bg-card border-border hover:border-primary shadow-sm'}`}
                  >
                    <div className="font-bold text-[9px] flex justify-between items-center mb-1">
                      <span className="truncate">{dose.name}</span>
                      {dose.completed && <CheckCircle2 className="h-2.5 w-2.5 text-success flex-shrink-0" />}
                    </div>
                    <div className="text-[8px] text-muted-foreground font-mono">{dose.time} • {dose.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
