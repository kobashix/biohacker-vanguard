"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Cycle, Supply } from "@/replicache";
import { nanoid } from "nanoid";
import { format } from "date-fns";

export function CycleManager({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const rep = getReplicache(userId);
  const cycles = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "cycle/" }).values().toArray();
    return list as Cycle[];
  }, { default: [] });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    await rep.mutate.createCycle({
      id: nanoid(),
      name,
      start_date: startDate,
      end_date: endDate || undefined,
    });

    // Auto-sync: deduct basic estimated supplies (e.g., ~30 uses for a standard phase block)
    const currentSupplies = await rep.query(async (tx) => {
      return await tx.scan({ prefix: "supply/" }).values().toArray();
    }) as Supply[];
    
    for (const supply of currentSupplies) {
      const nameLower = supply.name.toLowerCase();
      if (nameLower.includes("syringe") || nameLower.includes("needle") || nameLower.includes("wipe") || nameLower.includes("swab")) {
        await rep.mutate.updateSupply({
          ...supply,
          count: Math.max(0, supply.count - 30)
        });
      }
    }

    setName(""); setIsAdding(false);
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h3 className="card-title"><Calendar className="h-5 w-5 text-primary" /> Cycle Boundaries</h3>
          <p className="card-description">Define start and end dates for your protocol phases.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline p-2">
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-muted/10 rounded-lg border border-border space-y-4">
            <div className="form-group">
              <label className="form-label">Phase Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mass Gaining Phase 1" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">Define Cycle</button>
          </form>
        )}

        <div className="space-y-3">
          {cycles.map(c => (
            <div key={c.id} className="p-3 bg-background rounded-lg border border-border flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
                  {format(new Date(c.start_date), 'MMM d, yyyy')} 
                  {c.end_date ? ` — ${format(new Date(c.end_date), 'MMM d, yyyy')}` : ' — PRESENT'}
                </p>
              </div>
              <button className="btn btn-outline border-none p-1 opacity-20 hover:opacity-100"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          ))}
          {cycles.length === 0 && !isAdding && (
            <p className="text-center py-4 text-muted-foreground text-xs italic">No cycles defined yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
