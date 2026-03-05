"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound } from "@/replicache";
import { nanoid } from "nanoid";
import { calculateRequiredUnits } from "@/math";

export function VialManager({ userId }: { userId: string }) {
  // Form State
  const [vialName, setVialName] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([{ name: "BPC-157", mass_mg: 5 }]);
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'lyophilized' | 'reconstituted'>('lyophilized');
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

  // AUTOMATIC STACKING: Group by Compound Array (name+mass), Status, and Volume
  const stackedVials = useMemo(() => {
    const groups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};
    
    rawVials.forEach(v => {
      const compoundsKey = (v.compounds || []).map(c => `${c.name}:${c.mass_mg}`).join('|');
      const key = `${v.status}-${compoundsKey}-${v.volume_ml}-${v.remaining_volume_ml}`;
      if (!groups[key]) {
        groups[key] = { vial: v, count: 0, ids: [] };
      }
      groups[key].count++;
      groups[key].ids.push(v.id);
    });

    return Object.values(groups);
  }, [rawVials]);

  const handleAddCompoundField = () => {
    setCompounds([...compounds, { name: "", mass_mg: 0 }]);
  };

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const vol = status === 'reconstituted' ? parseFloat(volume) : 0;
    
    // Auto-generate name if empty
    const finalName = vialName || compounds.map(c => c.name).join(' / ');

    for (let i = 0; i < vialCount; i++) {
      await rep.mutate.createVial({
        id: nanoid(),
        name: finalName,
        compounds,
        volume_ml: vol,
        remaining_volume_ml: vol,
        status,
      });
    }
    setVialName(""); setCompounds([{ name: "", mass_mg: 0 }]); setIsAdding(false);
  };

  const handleLogDose = async (vial: Vial) => {
    if (!rep) return;
    const compound = vial.compounds[targetCompoundIndex];
    const units = calculateRequiredUnits(compound.mass_mg, vial.volume_ml, targetDose);
    
    await rep.mutate.logDose({
      id: nanoid(),
      vial_id: vial.id,
      substance: `${vial.name} (${compound.name})`,
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
          <p className="card-description">Dual-compound & Stacked support</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="card-content">
        {/* ADD FORM */}
        {isAdding && (
          <form onSubmit={handleAddVial} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', background: 'rgba(37, 99, 235, 0.02)' }}>
            <div className="form-group">
              <label className="form-label">Vial Label (Optional)</label>
              <input className="form-input" value={vialName} onChange={e => setVialName(e.target.value)} placeholder="e.g. Injury Stack" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Compounds in Vial</label>
              {compounds.map((c, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input className="form-input" placeholder="Name" value={c.name} onChange={e => {
                    const newC = [...compounds]; newC[idx].name = e.target.value; setCompounds(newC);
                  }} required />
                  <input className="form-input" type="number" placeholder="mg" value={c.mass_mg || ""} onChange={e => {
                    const newC = [...compounds]; newC[idx].mass_mg = parseFloat(e.target.value); setCompounds(newC);
                  }} required />
                  <button type="button" onClick={() => setCompounds(compounds.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ padding: '0', border: 'none' }} disabled={compounds.length === 1}><X className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
              <button type="button" onClick={handleAddCompoundField} className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <PlusCircle className="h-3 w-3 mr-2" /> Add Another Compound
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">State</label>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="lyophilized">Powder (Dry)</option>
                  <option value="reconstituted">Mixed (BAC Water)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Vial Count</label><input className="form-input" type="number" min="1" value={count} onChange={e => setCount(e.target.value)} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {status === 'reconstituted' && <div className="form-group"><label className="form-label">Total BAC Water (mL)</label><input className="form-input" type="number" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} required /></div>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save to Inventory</button>
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
                      {(group.vial.compounds || []).map(c => `${c.mass_mg}mg ${c.name}`).join(' + ')} 
                      {group.vial.status === 'reconstituted' ? ` | ${group.vial.remaining_volume_ml.toFixed(2)}mL remaining` : ' | Powder'}
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

              {/* LOG DOSE SUB-FORM (BLEND AWARE) */}
              {loggingVial?.id === group.vial.id && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>Log Dosing Information</p>
                  
                  {group.vial.compounds.length > 1 && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Calculate based on:</label>
                      <select className="form-input" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={targetCompoundIndex} onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}>
                        {group.vial.compounds.map((c, i) => <option key={i} value={i}>{c.name} ({c.mass_mg}mg)</option>)}
                      </select>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Dose (mcg)</label>
                    <input className="form-input" type="number" value={targetDose} onChange={e => setTargetDose(e.target.value)} />
                  </div>
                  <button onClick={() => handleLogDose(group.vial)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>Record Dose</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
