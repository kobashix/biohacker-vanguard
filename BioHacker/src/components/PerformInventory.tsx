"use client";

import { useState } from "react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Supply } from "@/replicache";
import { Save, CheckCircle2 } from "lucide-react";

export function PerformInventory({ userId }: { userId: string }) {
  const rep = getReplicache(userId);
  const [success, setSuccess] = useState(false);
  
  const vials = useSubscribe(rep, async (tx) => {
    return (await tx.scan({ prefix: "vial/" }).values().toArray()) as Vial[];
  }, { default: [] });

  const supplies = useSubscribe(rep, async (tx) => {
    return (await tx.scan({ prefix: "supply/" }).values().toArray()) as Supply[];
  }, { default: [] });

  // Local state to track edits before saving
  const [vialEdits, setVialEdits] = useState<Record<string, number>>({});
  const [supplyEdits, setSupplyEdits] = useState<Record<string, number>>({});

  const handleVialChange = (id: string, val: string) => {
    setVialEdits(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };
  
  const handleSupplyChange = (id: string, val: string) => {
    setSupplyEdits(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
  };

  const handleSaveAll = async () => {
    if (!rep) return;
    for (const [id, vol] of Object.entries(vialEdits)) {
      const v = vials.find(v => v.id === id);
      if (v) await rep.mutate.createVial({ ...v, remaining_volume_ml: vol });
    }
    for (const [id, count] of Object.entries(supplyEdits)) {
      const s = supplies.find(s => s.id === id);
      if (s) await rep.mutate.updateSupply({ ...s, count });
    }
    setVialEdits({});
    setSupplyEdits({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const hasEdits = Object.keys(vialEdits).length > 0 || Object.keys(supplyEdits).length > 0;

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center pb-2">
        <div>
          <h3 className="card-title text-primary">Perform Inventory</h3>
          <p className="card-description">Bulk update all your physical counts rapidly.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => window.history.pushState(null, '', '?tab=inventory')}
            className="btn btn-outline px-3 py-2 text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={!hasEdits}
            className="btn btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            style={{ background: success ? 'var(--success)' : undefined }}
          >
            {success ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {success ? "Saved" : "Save Counts"}
          </button>
        </div>
      </div>

      <div className="card-content p-0">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* VIALS */}
          <div style={{ background: 'var(--input-bg)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Vial Volumes (mL)</span>
          </div>
          {vials.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No vials found.</div>}
          {vials.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Capacity: {v.volume_ml} mL</p>
              </div>
              <input 
                type="number"
                step="0.1"
                min="0"
                max={v.volume_ml}
                value={vialEdits[v.id] ?? v.remaining_volume_ml}
                onChange={e => handleVialChange(v.id, e.target.value)}
                style={{ width: '80px', padding: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)', fontSize: '1rem', textAlign: 'center' }}
              />
            </div>
          ))}

          {/* SUPPLIES */}
          <div style={{ background: 'var(--input-bg)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', marginTop: vials.length ? '1rem' : 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Gear & Supplies</span>
          </div>
          {supplies.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No gear found.</div>}
          {supplies.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Unit: {s.unit}</p>
              </div>
              <input 
                type="number"
                step="1"
                min="0"
                value={supplyEdits[s.id] ?? s.count}
                onChange={e => handleSupplyChange(s.id, e.target.value)}
                style={{ width: '80px', padding: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)', fontSize: '1rem', textAlign: 'center' }}
              />
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
