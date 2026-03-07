"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, X, Link as LinkIcon, Beaker, ArrowLeft } from "lucide-react";
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
          <div className="sheet-overlay">
            <div className="sheet-inner">
              <div className="sheet-header">
                <button type="button" onClick={() => { setIsAdding(false); setSelectedVialIds([]); setName(""); }} className="sheet-back-btn"><ArrowLeft className="h-5 w-5" /></button>
                <span className="sheet-title">Define Cycle Phase</span>
              </div>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="sheet-section">
                  <p className="sheet-section-label">Linked Compounds (Optional)</p>
                  <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>Select active vials to associate with this cycle.</p>
                  {activeVials.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeVials.map(v => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleVial(v.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1rem', borderRadius: '0.75rem',
                            border: `2px solid ${selectedVialIds.includes(v.id) ? '#2563eb' : '#27272a'}`,
                            background: selectedVialIds.includes(v.id) ? 'rgba(37,99,235,0.15)' : '#18181b',
                            color: selectedVialIds.includes(v.id) ? '#60a5fa' : '#a1a1aa',
                            fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <Beaker className="h-4 w-4" />{v.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: '#a1a1aa', background: '#18181b', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #27272a' }}>No active vials in inventory to link.</div>
                  )}
                </div>

                <div className="sheet-section" style={{ borderTop: '1px solid #27272a', paddingTop: '1.5rem' }}>
                  <p className="sheet-section-label">Phase Name (Optional)</p>
                  <input
                    className="form-input"
                    style={{ background: '#18181b', fontSize: '1rem', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid #27272a', fontWeight: 700 }}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={selectedVialIds.length > 0 ? 'Auto-generates from compounds...' : 'e.g. Mass Phase 1'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <p className="sheet-section-label">Start Date</p>
                    <input className="form-input" style={{ background: '#18181b', borderRadius: '0.75rem', border: '2px solid #27272a', padding: '0.875rem' }} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>
                  <div>
                    <p className="sheet-section-label">End Date</p>
                    <input className="form-input" style={{ background: '#18181b', borderRadius: '0.75rem', border: '2px solid #27272a', padding: '0.875rem' }} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="sheet-cta">Save Cycle Definition</button>
              </form>
            </div>
          </div>
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

