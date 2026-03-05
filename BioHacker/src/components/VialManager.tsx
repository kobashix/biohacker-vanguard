"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save } from "lucide-react";
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
  
  // UI State for Editing/Dosing
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [targetDose, setTargetDose] = useState("250");

  const rep = getReplicache(userId);

  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  // AUTOMATIC STACKING: Group duplicates by Name, Status, Mass, and Volume
  const stackedVials = useMemo(() => {
    const groups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};
    
    rawVials.forEach(v => {
      const key = `${v.name}-${v.status}-${v.mass_mg}-${v.volume_ml}-${v.remaining_volume_ml}`;
      if (!groups[key]) {
        groups[key] = { vial: v, count: 0, ids: [] };
      }
      groups[key].count++;
      groups[key].ids.push(v.id);
    });

    return Object.values(groups);
  }, [rawVials]);

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const vol = status === 'reconstituted' ? parseFloat(volume) : 0;
    
    for (let i = 0; i < vialCount; i++) {
      await rep.mutate.createVial({
        id: nanoid(),
        name,
        mass_mg: parseFloat(mass),
        volume_ml: vol,
        remaining_volume_ml: vol,
        status,
      });
    }
    setName(""); setIsAdding(false);
  };

  const handleUpdateVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep || !editingVial) return;
    await rep.mutate.updateVial(editingVial);
    setEditingVial(null);
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
    setLoggingVial(null);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title"><Beaker className="h-5 w-5 text-primary" /> Inventory</h3>
          <p className="card-description">Auto-stacked duplicates</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="card-content">
        {/* ADD FORM */}
        {isAdding && (
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius)' }}>
            <div className="form-group"><label className="form-label">Compound Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">State</label>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="lyophilized">Powder (Dry)</option>
                  <option value="reconstituted">Mixed (BAC Water)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Vial Count</label><input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Mass (mg)</label><input className="form-input" type="number" step="0.1" value={mass} onChange={e => setMass(e.target.value)} /></div>
              {status === 'reconstituted' && <div className="form-group"><label className="form-label">BAC Water (mL)</label><input className="form-input" type="number" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} /></div>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to Inventory</button>
          </form>
        )}

        {/* EDIT MODAL/FORM */}
        {editingVial && (
          <form onSubmit={handleUpdateVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--success)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Edit {editingVial.name}</h4>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={editingVial.name} onChange={e => setEditingVial({...editingVial, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Remaining mL</label><input className="form-input" type="number" step="0.01" value={editingVial.remaining_volume_ml} onChange={e => setEditingVial({...editingVial, remaining_volume_ml: parseFloat(e.target.value)})} /></div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save className="h-4 w-4 mr-2" /> Save</button>
              <button type="button" onClick={() => setEditingVial(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        )}

        {/* INVENTORY LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stackedVials.map(group => (
            <div key={group.vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '50%', background: group.vial.status === 'reconstituted' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(161, 161, 170, 0.1)' }}>
                    {group.vial.status === 'reconstituted' ? <Droplets className="h-4 w-4 text-primary" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{group.vial.name} {group.count > 1 && <span style={{ color: 'var(--primary)' }}>x{group.count}</span>}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      {group.vial.mass_mg}mg | {group.vial.status === 'reconstituted' ? `${group.vial.remaining_volume_ml.toFixed(2)}mL rem.` : 'Powder'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {group.vial.status === 'reconstituted' && (
                    <button onClick={() => setLoggingVial(loggingVial?.id === group.vial.id ? null : group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Log Dose"><Syringe className="h-4 w-4 text-primary" /></button>
                  )}
                  <button onClick={() => setEditingVial(group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Edit"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={async () => { if(confirm("Delete item?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>

              {/* LOG DOSE SUB-FORM */}
              {loggingVial?.id === group.vial.id && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Dose (mcg)</label>
                    <input className="form-input" type="number" value={targetDose} onChange={e => setTargetDose(e.target.value)} />
                  </div>
                  <button onClick={() => handleLogDose(group.vial)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>Log Dosing Information</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
