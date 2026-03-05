"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Beaker } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { nanoid } from "nanoid";

export function VialManager({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [mass, setMass] = useState("5");
  const [volume, setVolume] = useState("2");
  const [isAdding, setIsAdding] = useState(false);

  const rep = getReplicache(userId);

  const vials = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "vial/" }).values().toArray();
      return list as Vial[];
    },
    { default: [] }
  );

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;

    const id = nanoid();
    const newVial: Vial = {
      id,
      name,
      mass_mg: parseFloat(mass),
      volume_ml: parseFloat(volume),
      remaining_volume_ml: parseFloat(volume),
    };

    await rep.mutate.createVial(newVial);
    setName("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!rep) return;
    // Note: Add deleteVial mutator to replicache.ts if not present
    alert("Delete functionality pending mutator hardening.");
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title">
            <Beaker className="h-5 w-5 text-primary" />
            Vial Inventory
          </h3>
          <p className="card-description">Manage your lyophilized stock</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="btn btn-outline" 
          style={{ padding: '0.25rem 0.75rem' }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
            <div className="form-group">
              <label className="form-label">Compound Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BPC-157" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Mass (mg)</label>
                <input className="form-input" type="number" value={mass} onChange={e => setMass(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">BAC Water (mL)</label>
                <input className="form-input" type="number" value={volume} onChange={e => setVolume(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save Vial</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vials.length === 0 && !isAdding && (
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem', padding: '1rem' }}>
              No vials tracked. Click + to add your first one.
            </p>
          )}
          {vials.map(vial => (
            <div key={vial.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{vial.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  {vial.mass_mg}mg / {vial.volume_ml}mL | {vial.remaining_volume_ml.toFixed(2)}mL rem.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleDelete(vial.id)} className="btn btn-outline" style={{ padding: '0.25rem', borderColor: 'transparent' }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
