"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { nanoid } from "nanoid";
import { calculateRequiredUnits } from "@/math";

export function VialManager({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [mass, setMass] = useState("5");
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'lyophilized' | 'reconstituted'>('lyophilized');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [targetDose, setTargetDose] = useState("250");

  const rep = getReplicache(userId);

  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const displayVials = useMemo(() => {
    const groups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};
    const individualReconstituted: Vial[] = [];
    rawVials.forEach(v => {
      if (v.status === 'lyophilized') {
        const key = `${v.name}-${v.mass_mg}`;
        if (!groups[key]) groups[key] = { vial: v, count: 0, ids: [] };
        groups[key].count++;
        groups[key].ids.push(v.id);
      } else {
        individualReconstituted.push(v);
      }
    });
    return { lyophilized: Object.values(groups), reconstituted: individualReconstituted };
  }, [rawVials]);

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const vol = status === 'reconstituted' ? parseFloat(volume) : 0;
    
    for (let i = 0; i < vialCount; i++) {
      // Don't suffix lyophilized vials so they group correctly by name
      const displayName = (status === 'reconstituted' && vialCount > 1) 
        ? `${name} #${i + 1}` 
        : name;

      await rep.mutate.createVial({
        id: nanoid(),
        name: displayName,
        mass_mg: parseFloat(mass),
        volume_ml: vol,
        remaining_volume_ml: vol,
        status,
      });
    }
    setName(""); setIsAdding(false);
  };

  const handleLogDose = async (vial: Vial) => {
    if (!rep) return;
    const units = calculateRequiredUnits(vial.mass_mg, vial.volume_ml, targetDose);
    await rep.mutate.logDose({
      id: nanoid(),
      vial_id: vial.id,
      substance: vial.name,
      dose_mcg: parseFloat(targetDose),
      units_iu: units.toNumber(),
      timestamp: Date.now(),
    });
    setLoggingId(null);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title"><Beaker className="h-5 w-5 text-primary" /> Inventory</h3>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="card-content">
        {isAdding && (
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div className="form-group"><label className="form-label">Compound Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">State</label><select className="form-input" value={status} onChange={e => setStatus(e.target.value as any)}><option value="lyophilized">Lyophilized</option><option value="reconstituted">Reconstituted</option></select></div>
              <div className="form-group"><label className="form-label">Count</label><input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Mass (mg)</label><input className="form-input" type="number" value={mass} onChange={e => setMass(e.target.value)} /></div>
              {status === 'reconstituted' && <div className="form-group"><label className="form-label">Water (mL)</label><input className="form-input" type="number" value={volume} onChange={e => setVolume(e.target.value)} /></div>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to Inventory</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayVials.lyophilized.map(group => (
            <div key={group.vial.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{group.vial.name} <span style={{color: 'var(--primary)'}}>x{group.count}</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{group.vial.mass_mg}mg | Lyophilized</div>
              </div>
              <button onClick={async () => { if(confirm("Delete group?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ border: 'none' }}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          ))}

          {displayVials.reconstituted.map(vial => (
            <div key={vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Droplets className="h-4 w-4 text-primary" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{vial.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{vial.remaining_volume_ml.toFixed(2)}mL remaining</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => setLoggingId(loggingId === vial.id ? null : vial.id)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }}><Syringe className="h-4 w-4 text-primary" /></button>
                  <button onClick={() => setEditingId(vial.id)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }}><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => rep?.mutate.deleteVial(vial.id)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>

              {loggingId === vial.id && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--primary)' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Dose Amount (mcg)</label>
                    <input className="form-input" type="number" value={targetDose} onChange={e => setTargetDose(e.target.value)} />
                  </div>
                  <button onClick={() => handleLogDose(vial)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>Confirm Log</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
