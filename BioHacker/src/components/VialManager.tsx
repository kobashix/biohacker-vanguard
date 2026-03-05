"use client";

import { useState } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { nanoid } from "nanoid";

export function VialManager({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [mass, setMass] = useState("5");
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'lyophilized' | 'reconstituted'>('lyophilized');
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

    const vialCount = parseInt(count) || 1;
    const vol = status === 'reconstituted' ? parseFloat(volume) : 0;
    
    // Perform bulk addition
    for (let i = 0; i < vialCount; i++) {
      const id = nanoid();
      const newVial: Vial = {
        id,
        name: vialCount > 1 ? `${name} #${i + 1}` : name,
        mass_mg: parseFloat(mass),
        volume_ml: vol,
        remaining_volume_ml: vol,
        status,
      };
      await rep.mutate.createVial(newVial);
    }

    setName("");
    setCount("1");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!rep) return;
    alert("Delete functionality pending server-side mutator sync.");
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title">
            <Beaker className="h-5 w-5 text-primary" />
            Inventory Management
          </h3>
          <p className="card-description">Track dry mass and reconstituted vials</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="btn btn-outline" 
          style={{ padding: '0.25rem 0.75rem' }}
        >
          {isAdding ? "Cancel" : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div className="form-group">
              <label className="form-label">Compound Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BPC-157" required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vial State</label>
                <select 
                  className="form-input" 
                  value={status} 
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="lyophilized">Lyophilized</option>
                  <option value="reconstituted">Reconstituted</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vial Count</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="form-input" 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={count} 
                    onChange={e => setCount(e.target.value)} 
                    required 
                  />
                  <Layers className="h-4 w-4 text-muted-foreground" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Mass (mg)</label>
                <input className="form-input" type="number" step="0.1" value={mass} onChange={e => setMass(e.target.value)} required />
              </div>
              
              {status === 'reconstituted' && (
                <div className="form-group">
                  <label className="form-label">BAC Water (mL)</label>
                  <input className="form-input" type="number" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} required />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Add {count} Vial{parseInt(count) > 1 ? 's' : ''}
            </button>
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
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem', borderRadius: '50%', background: vial.status === 'reconstituted' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(161, 161, 170, 0.1)' }}>
                  {vial.status === 'reconstituted' ? <Droplets className="h-4 w-4 text-primary" /> : <Beaker className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{vial.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {vial.mass_mg}mg {vial.status === 'reconstituted' ? `| ${vial.remaining_volume_ml.toFixed(2)}mL rem.` : '| Dry Powder'}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(vial.id)} className="btn btn-outline" style={{ padding: '0.25rem', borderColor: 'transparent' }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
