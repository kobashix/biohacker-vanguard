"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound } from "@/replicache";
import { nanoid } from "nanoid";
import { calculateRequiredUnits } from "@/math";
import Decimal from "decimal.js";

export function VialManager({ userId }: { userId: string }) {
  // Form State
  const [vialName, setVialName] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([{ name: "BPC-157", mass_mg: 5, unit: 'mg' }]);
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'powder' | 'mixed' | 'pill'>('powder');
  const [isAdding, setIsAdding] = useState(false);
  
  // UI State for Editing/Dosing
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [targetDose, setTargetDose] = useState("250");
  const [targetCompoundIndex, setTargetCompoundIndex] = useState(0);

  const rep = getReplicache(userId);

  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const stackedVials = useMemo(() => {
    const groups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};
    rawVials.forEach(v => {
      const compoundsKey = (v.compounds || []).map(c => `${c.name}:${c.mass_mg}:${c.unit}`).join('|');
      const key = `${v.status}-${compoundsKey}-${v.volume_ml}-${v.remaining_volume_ml}-${v.remaining_pills}`;
      if (!groups[key]) groups[key] = { vial: v, count: 0, ids: [] };
      groups[key].count++;
      groups[key].ids.push(v.id);
    });
    return Object.values(groups);
  }, [rawVials]);

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const vol = status === 'mixed' ? parseFloat(volume) : 0;
    const finalName = vialName || compounds.map(c => c.name).join(' / ');

    for (let i = 0; i < vialCount; i++) {
      await rep.mutate.createVial({
        id: nanoid(),
        name: finalName,
        compounds,
        volume_ml: vol,
        remaining_volume_ml: vol,
        status,
        pill_count: status === 'pill' ? parseInt(volume) : undefined,
        remaining_pills: status === 'pill' ? parseInt(volume) : undefined,
      });
    }
    setIsAdding(false);
  };

  const handleUpdateVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep || !editingVial) return;
    await rep.mutate.updateVial(editingVial);
    setEditingVial(null);
  };

  const handleLogDose = async (vial: Vial) => {
    if (!rep) return;
    const compound = vial.compounds[targetCompoundIndex];
    let units_iu = 0;
    if (vial.status === 'mixed') {
      if (compound.unit === 'mg') {
        units_iu = calculateRequiredUnits(compound.mass_mg, vial.volume_ml, targetDose).toNumber();
      } else {
        const totalIu = new Decimal(compound.mass_mg);
        const targetIu = new Decimal(targetDose);
        const volNeededMl = targetIu.dividedBy(totalIu.dividedBy(vial.volume_ml));
        units_iu = volNeededMl.times(100).toNumber();
      }
    }
    await rep.mutate.logDose({
      id: nanoid(),
      vial_id: vial.id,
      substance: `${vial.name} (${compound.name})`,
      dose_mcg: parseFloat(targetDose),
      units_iu,
      timestamp: Date.now(),
    });
    setLoggingVial(null);
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
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius)' }}>
            <div className="form-group"><label className="form-label">Label</label><input className="form-input" value={vialName} onChange={e => setVialName(e.target.value)} placeholder="e.g. Bulk Stock" /></div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Compounds</label>
              {compounds.map((c, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px 30px', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <input className="form-input" value={c.name} onChange={e => { const n = [...compounds]; n[idx].name = e.target.value; setCompounds(n); }} required />
                  <input className="form-input" type="number" value={c.mass_mg || ""} onChange={e => { const n = [...compounds]; n[idx].mass_mg = parseFloat(e.target.value); setCompounds(n); }} required />
                  <select className="form-input" value={c.unit} onChange={e => { const n = [...compounds]; n[idx].unit = e.target.value as any; setCompounds(n); }}>
                    <option value="mg">mg</option><option value="IU">IU</option>
                  </select>
                  <button type="button" onClick={() => setCompounds(compounds.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ border: 'none' }} disabled={compounds.length === 1}><X className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setCompounds([...compounds, { name: "", mass_mg: 0, unit: 'mg' }])} className="btn btn-outline" style={{ width: '100%', fontSize: '0.7rem' }}><PlusCircle className="h-3 w-3 mr-2" /> Add Blend</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">State</label>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="powder">Powder (Dry)</option><option value="mixed">Mixed (Liquid)</option><option value="pill">Pill (Oral)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Count</label><input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">{status === 'pill' ? "Pills" : "Volume (mL)"}</label><input className="form-input" type="number" value={volume} onChange={e => setVolume(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Inventory</button>
          </form>
        )}

        {editingVial && (
          <form onSubmit={handleUpdateVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--success)', borderRadius: 'var(--radius)' }}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={editingVial.name} onChange={e => setEditingVial({...editingVial, name: e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">{editingVial.status === 'pill' ? 'Remaining Pills' : 'Remaining mL'}</label>
              <input className="form-input" type="number" step="0.01" 
                value={editingVial.status === 'pill' ? (editingVial.remaining_pills || 0) : editingVial.remaining_volume_ml} 
                onChange={e => setEditingVial({
                  ...editingVial, 
                  remaining_volume_ml: editingVial.status !== 'pill' ? parseFloat(e.target.value) : editingVial.remaining_volume_ml,
                  remaining_pills: editingVial.status === 'pill' ? parseInt(e.target.value) : editingVial.remaining_pills
                })} 
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save className="h-4 w-4 mr-2" /> Update</button>
              <button type="button" onClick={() => setEditingVial(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stackedVials.map(group => (
            <div key={group.vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '50%', background: group.vial.status === 'mixed' ? 'rgba(37, 99, 235, 0.1)' : group.vial.status === 'pill' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(161, 161, 170, 0.1)' }}>
                    {group.vial.status === 'mixed' ? <Droplets className="h-4 w-4 text-primary" /> : group.vial.status === 'pill' ? <CircleDot className="h-4 w-4 text-success" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{group.vial.name} {group.count > 1 && <span style={{ color: 'var(--primary)' }}>x{group.count}</span>}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      {(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit} ${c.name}`).join(' + ')} 
                      {group.vial.status === 'mixed' ? ` | ${group.vial.remaining_volume_ml.toFixed(2)}mL rem.` : group.vial.status === 'pill' ? ` | ${group.vial.remaining_pills} pills rem.` : ' | Powder'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {group.vial.status !== 'powder' && (
                    <button onClick={() => setLoggingVial(loggingVial?.id === group.vial.id ? null : group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Log Dose"><Syringe className="h-4 w-4 text-primary" /></button>
                  )}
                  <button onClick={() => setEditingVial(group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Edit"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={async () => { if(confirm("Delete?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
              {loggingVial?.id === group.vial.id && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>{group.vial.status === 'pill' ? 'Take Pill' : 'Record Injection'}</p>
                  {group.vial.status === 'mixed' && group.vial.compounds.length > 1 && (
                    <select className="form-input" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} value={targetCompoundIndex} onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}>
                      {group.vial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                    </select>
                  )}
                  <div className="form-group"><label className="form-label" style={{ fontSize: '0.75rem' }}>{group.vial.status === 'pill' ? 'Count' : 'Dose (mcg/IU)'}</label><input className="form-input" type="number" value={targetDose} onChange={e => setTargetDose(e.target.value)} /></div>
                  <button onClick={() => handleLogDose(group.vial)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>Record Action</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
