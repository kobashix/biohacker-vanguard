"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, SubjectiveLog } from "@/replicache";
import { format } from "date-fns";
import { Download, History, Syringe, Heart } from "lucide-react";

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
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
    return list as DoseLog[];
  }, { default: [] });

  const subjectiveLogs = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "subjective/" }).values().toArray();
    return list as SubjectiveLog[];
  }, { default: [] });

  const combinedHistory = useMemo(() => {
    const history = [
      ...doseLogs.map(l => ({ ...l, type: 'dose' })),
      ...subjectiveLogs.map(s => ({ ...s, type: 'subjective' }))
    ];
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [doseLogs, subjectiveLogs]);

  const exportToCSV = () => {
    const headers = ["Timestamp", "Type", "Substance/Mood", "Amount/Energy", "Site/Sleep", "Notes"];
    const rows = combinedHistory.map(item => {
      if (item.type === 'dose') {
        const l = item as any;
        return [format(l.timestamp, 'yyyy-MM-dd HH:mm'), "Dose", l.substance, `${l.dose_amount} ${l.unit}`, l.injection_site || "N/A", ""];
      } else {
        const s = item as any;
        return [format(s.timestamp, 'yyyy-MM-dd HH:mm'), "Recovery", `Mood: ${s.mood}`, `Energy: ${s.energy}`, `Sleep: ${s.sleep_quality}`, s.notes || ""];
      }
    });

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
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cycle History</h1>
          <p className="text-muted-foreground">Comprehensive log of all pins, doses, and recovery metrics.</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary flex gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </header>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Type</th>
                <th>Event</th>
                <th>Details</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {combinedHistory.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No history entries found.</td></tr>
              )}
              {combinedHistory.map((item: any, idx) => (
                <tr key={idx}>
                  <td className="text-xs font-mono">{format(item.timestamp, 'MMM d, h:mm a')}</td>
                  <td>
                    {item.type === 'dose' ? 
                      <span className="flex items-center gap-1 text-primary text-xs font-bold uppercase"><Syringe className="h-3 w-3" /> Pin</span> :
                      <span className="flex items-center gap-1 text-success text-xs font-bold uppercase"><Heart className="h-3 w-3" /> Recovery</span>
                    }
                  </td>
                  <td className="font-semibold text-sm">
                    {item.type === 'dose' ? item.substance : `Pump & Recovery Log`}
                  </td>
                  <td className="text-xs">
                    {item.type === 'dose' ? 
                      `${item.dose_amount} ${item.unit} ${item.injection_site ? `(@ ${item.injection_site})` : ''}` :
                      `M:${item.mood} E:${item.energy} S:${item.sleep_quality}`
                    }
                  </td>
                  <td className="text-xs text-muted-foreground max-w-[200px] truncate">{item.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
