"use client";

import { useState } from "react";
import { Package, Plus, Minus, Trash2 } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Supply } from "@/replicache";

export function SupplyTracker({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [count, setCount] = useState("100");
  const [unit, setUnit] = useState("pcs");
  const [isAdding, setIsAdding] = useState(false);

  const rep = getReplicache(userId);
  const supplies = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "supply/" }).values().toArray();
    return list as Supply[];
  }, { default: [] });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    await rep.mutate.updateSupply({
      id: crypto.randomUUID(),
      name,
      count: parseInt(count),
      unit
    });
    setName(""); setIsAdding(false);
  };

  const adjustCount = async (supply: Supply, delta: number) => {
    if (!rep) return;
    await rep.mutate.updateSupply({
      ...supply,
      count: Math.max(0, supply.count + delta)
    });
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h3 className="card-title"><Package className="h-5 w-5 text-primary" /> Ancillary Supplies</h3>
          <p className="card-description">Track needles, alcohol wipes, and bacteriostatic water.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline p-2">
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-muted/10 rounded-lg border border-border space-y-4">
            <div className="form-group">
              <label className="form-label">Supply Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 31G Insulin Syringes" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Initial Count</label>
                <input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="pcs, mL, etc." required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">Add Supply</button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {supplies.map(s => (
            <div key={s.id} className="p-4 bg-background rounded-lg border border-border flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-xl font-mono text-primary">{s.count} <span className="text-xs text-muted-foreground uppercase">{s.unit}</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => adjustCount(s, -1)} className="btn btn-outline p-1"><Minus className="h-4 w-4" /></button>
                <button onClick={() => adjustCount(s, 1)} className="btn btn-outline p-1"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {supplies.length === 0 && !isAdding && (
            <p className="col-span-full text-center py-6 text-muted-foreground text-sm italic">No supplies tracked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { X } from "lucide-react";

