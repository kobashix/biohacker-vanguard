"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, X, Link as LinkIcon, Beaker } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Cycle, Supply, Vial } from "@/replicache";
import { format } from "date-fns";

export function CycleManager({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState("");
  const [selectedVialIds, setSelectedVialIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const rep = getReplicache(userId);
  const cycles = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "cycle/" }).values().toArray();
    return list as Cycle[];
  }, { default: [] });

  const vials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  // Filter vials to only show active ones (mixed, pill, or powder with protocols)
  const activeVials = vials.filter(v => v.status === 'mixed' || v.status === 'pill' || v.status === 'powder');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;

    let finalName = name;
    if (!finalName.trim()) {
      if (selectedVialIds.length > 0) {
        const selectedNames = selectedVialIds
           .map(id => vials.find(v => v.id === id)?.name)
           .filter(Boolean);
        finalName = selectedNames.length > 0 ? `Phase: ${selectedNames.join(' + ')}` : "Clinical Phase";
      } else {
        finalName = "Clinical Phase";
      }
    }

    await rep.mutate.createCycle({
      id: crypto.randomUUID(),
      name: finalName,
      start_date: startDate,
      end_date: endDate || undefined,
      vial_ids: selectedVialIds.length > 0 ? selectedVialIds : undefined
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

    setName(""); 
    setSelectedVialIds([]);
    setIsAdding(false);
  };

  const toggleVial = (id: string) => {
    if (selectedVialIds.includes(id)) {
      setSelectedVialIds(selectedVialIds.filter(v => v !== id));
    } else {
      setSelectedVialIds([...selectedVialIds, id]);
    }
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h3 className="card-title"><Calendar className="h-5 w-5 text-primary" /> Cycle Boundaries</h3>
          <p className="card-description">Define start and end dates for your protocol phases.</p>
        </div>
        <button onClick={() => { setIsAdding(!isAdding); setSelectedVialIds([]); setName(""); }} className="btn btn-outline p-2">
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-muted/10 rounded-lg border border-border space-y-4">
            <div className="form-group mb-2">
              <label className="form-label">Linked Compounds (Optional)</label>
              <p className="text-xs text-muted-foreground mb-2">Select the active vials to associate with this cycle. If Phase Name is empty, it will auto-generate based on these selections.</p>
              {activeVials.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeVials.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVial(v.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                        selectedVialIds.includes(v.id) 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Beaker className="h-3 w-3" />
                      {v.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs italic text-muted-foreground bg-background p-2 rounded border border-border">No active vials in inventory to link.</div>
              )}
            </div>

            <div className="form-group border-t border-border pt-4">
              <label className="form-label">Phase Name (Optional)</label>
              <input className="form-input text-lg font-bold" value={name} onChange={e => setName(e.target.value)} placeholder={selectedVialIds.length > 0 ? "Leave blank to auto-generate..." : "e.g. Mass Gaining Phase 1"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full shadow-md">Define Cycle</button>
          </form>
        )}

        <div className="space-y-3">
          {cycles.map(c => (
            <div key={c.id} className="p-3 bg-background rounded-lg border border-border flex justify-between items-start hover:border-primary/30 transition-colors">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-foreground">{c.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter mb-2">
                  {format(new Date(c.start_date), 'MMM d, yyyy')} 
                  {c.end_date ? ` — ${format(new Date(c.end_date), 'MMM d, yyyy')}` : ' — PRESENT'}
                </p>
                
                {/* Linked Compounds Render */}
                {c.vial_ids && c.vial_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.vial_ids.map(vid => {
                      const vial = vials.find(v => v.id === vid);
                      if (!vial) return null;
                      return (
                        <div key={vid} className="flex items-center gap-1 text-[9px] font-bold uppercase bg-[#18181b] border border-[#27272a] text-muted-foreground px-1.5 py-0.5 rounded shadow-sm">
                          <LinkIcon className="h-2.5 w-2.5 text-primary" />
                          {vial.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button onClick={async () => {
                if (confirm(`Delete cycle ${c.name}?`)) {
                  await rep?.mutate.deleteCycle(c.id);
                }
              }} className="btn btn-outline border-none p-1 opacity-40 hover:opacity-100 mt-1"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          ))}
          {cycles.length === 0 && !isAdding && (
            <p className="text-center py-6 text-muted-foreground text-xs italic bg-muted/5 border border-dashed border-border rounded-lg">No cycles defined yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

