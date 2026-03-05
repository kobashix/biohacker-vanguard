"use client";

import { useMemo } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Protocol, Vial } from "@/replicache";
import { Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TimelineItem {
  type: 'log' | 'projection';
  timestamp: number;
  label: string;
  amount: string;
  status: 'completed' | 'upcoming' | 'missed';
}

export function DosageCalendar({ userId }: { userId: string }) {
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

  const roadmap = useMemo(() => {
    const timeline: TimelineItem[] = [];

    // 1. Process Past Logs (Last 24h)
    logs.filter(l => l.timestamp > Date.now() - 24 * 3600000).forEach(log => {
      timeline.push({
        type: 'log',
        timestamp: log.timestamp,
        label: log.substance,
        amount: `${log.dose_mcg}${log.units_iu === 0 ? ' pills' : 'mcg'}`,
        status: 'completed'
      });
    });

    // 2. Project Future Doses from Protocols (Next 48h)
    protocols.forEach(protocol => {
      const vial = vials.find(v => v.id === protocol.vial_id);
      if (!vial) return;

      const lastLog = [...logs]
        .filter(l => l.vial_id === protocol.vial_id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      let nextDoseTime = lastLog 
        ? lastLog.timestamp + (protocol.frequency_hours * 3600000)
        : protocol.start_time;

      while (nextDoseTime < Date.now() + 48 * 3600000) {
        if (nextDoseTime > Date.now()) {
          timeline.push({
            type: 'projection',
            timestamp: nextDoseTime,
            label: vial.name,
            amount: `${protocol.dose_amount}${vial.status === 'pill' ? ' pills' : 'mcg'}`,
            status: 'upcoming'
          });
        } else if (nextDoseTime < Date.now() && (!lastLog || lastLog.timestamp < nextDoseTime - 3600000)) {
          timeline.push({
            type: 'projection',
            timestamp: nextDoseTime,
            label: vial.name,
            amount: `${protocol.dose_amount}${vial.status === 'pill' ? ' pills' : 'mcg'}`,
            status: 'missed'
          });
        }
        nextDoseTime += (protocol.frequency_hours * 3600000);
      }
    });

    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  }, [logs, protocols, vials]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Dosage Roadmap
        </h3>
        <p className="card-description">Logs and projections (Next 48h)</p>
      </div>
      <div className="card-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roadmap.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No scheduled doses or recent logs.</p>
          )}
          {roadmap.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderLeft: '2px solid var(--border)', marginLeft: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-9px', top: '0', background: 'var(--card)', borderRadius: '50%', padding: '2px' }}>
                {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-success" />}
                {item.status === 'upcoming' && <Clock className="h-4 w-4 text-primary" />}
                {item.status === 'missed' && <AlertTriangle className="h-4 w-4 text-destructive" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{format(new Date(item.timestamp), 'MMM d, h:mm a')}</div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.amount} • {item.status.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
