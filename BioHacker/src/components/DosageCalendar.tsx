"use client";

import { useMemo, useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";

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

      const logForDay = logs.find(l => l.vial_id === vial.id && isSameDay(new Date(l.timestamp), day));
      const unit = vial.status === 'pill' ? 'pills' : (vial.compounds[0]?.unit === 'g' ? 'mg' : (vial.compounds[0]?.unit === 'IU' ? 'IU' : 'mcg'));

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
          <p className="card-description">Tap a dose to log completion</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn btn-outline" style={{padding: '0.25rem'}}><ChevronLeft className="h-4 w-4"/></button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn btn-outline" style={{padding: '0.25rem'}}><ChevronRight className="h-4 w-4"/></button>
        </div>
      </div>
      <div className="card-content" style={{ padding: '0', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', borderTop: '1px solid var(--border)' }}>
          {days.map((day, i) => (
            <div key={i} style={{ borderRight: i < 6 ? '1px solid var(--border)' : 'none', minHeight: '150px' }}>
              <div style={{ padding: '0.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{format(day, 'EEE')}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{format(day, 'd')}</div>
              </div>
              <div style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {getDosesForDay(day).map((dose, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onSelectVial(dose.vialId)}
                    style={{ 
                      padding: '0.4rem', borderRadius: '4px', background: dose.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--card)', 
                      border: `1px solid ${dose.completed ? 'var(--success)' : 'var(--border)'}`, cursor: 'pointer', fontSize: '0.75rem' 
                    }}
                  >
                    <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      {dose.name}
                      {dose.completed && <CheckCircle2 className="h-3 w-3 text-success" />}
                    </div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>{dose.amount}</div>
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
