"use client";

import { useMemo, useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, differenceInDays } from "date-fns";

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
    
    protocols.forEach(protocol => {
      const vial = vials.find(v => v.id === protocol.vial_id);
      if (!vial) return;

      // Logic for "X days on / Y days off"
      const daysOn = protocol.days_on || 7;
      const daysOff = protocol.days_off || 0;
      const cycleLength = daysOn + daysOff;
      
      const startOfDosing = new Date(protocol.start_time);
      const diffDays = differenceInDays(day, startOfDosing);
      
      // Eligibility check
      const isDayOn = (diffDays % cycleLength) < daysOn;
      if (!isDayOn) return;

      const logForDay = logs.find(l => l.vial_id === vial.id && isSameDay(new Date(l.timestamp), day));
      
      let unit = 'mcg';
      if (vial.status === 'pill') unit = 'pills';
      else if (vial.compounds[0]?.unit === 'g') unit = 'mg';
      else if (vial.compounds[0]?.unit === 'IU') unit = 'IU';

      dailyDoses.push({
        vialId: vial.id,
        name: vial.name,
        amount: `${protocol.dose_amount} ${unit}`,
        completed: !!logForDay,
        time: format(new Date(protocol.start_time), 'h:mm a')
      });
    });

    return dailyDoses;
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title"><CalendarIcon className="h-5 w-5 text-primary" /> Weekly Protocol</h3>
          <p className="card-description">Interactive schedule with on/off cycle support</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronLeft className="h-4 w-4"/></button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn btn-outline p-1"><ChevronRight className="h-4 w-4"/></button>
        </div>
      </div>
      <div className="card-content p-0 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[800px] border-t border-border">
          {days.map((day, i) => (
            <div key={i} className={`min-h-[120px] border-border ${i < 6 ? 'border-r' : ''}`}>
              <div className="p-2 text-center bg-muted/10 border-b border-border">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">{format(day, 'EEE')}</div>
                <div className="font-bold text-sm">{format(day, 'd')}</div>
              </div>
              <div className="p-2 space-y-2">
                {getDosesForDay(day).map((dose, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onSelectVial(dose.vialId)}
                    className={`p-2 rounded border cursor-pointer transition-all ${dose.completed ? 'bg-success/10 border-success' : 'bg-card border-border hover:border-primary'}`}
                  >
                    <div className="font-bold text-[10px] flex justify-between items-center">
                      <span className="truncate">{dose.name}</span>
                      {dose.completed && <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />}
                    </div>
                    <div className="text-[9px] text-muted-foreground">{dose.amount}</div>
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
