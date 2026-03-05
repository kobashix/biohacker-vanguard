"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot, Archive, Activity } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound } from "@/replicache";
import { nanoid } from "nanoid";
import { calculateRequiredUnits } from "@/math";
import Decimal from "decimal.js";

export function VialManager({ userId }: { userId: string }) {
  const [vialName, setVialName] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([{ name: "", mass_mg: 0, unit: 'mg' }]);
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'powder' | 'mixed' | 'pill'>('powder');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [targetDose, setTargetDose] = useState("250");
  const [targetCompoundIndex, setTargetCompoundIndex] = useState(0);

  const rep = getReplicache(userId);
  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  // SPLIT LOGIC: Active vs Stockpile
  const inventory = useMemo(() => {
    const active: { vial: Vial; count: number; ids: string[] }[] = [];
    const stockpileGroups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};

    rawVials.forEach(v => {
      // 1. Logic for Active Protocol (Anything Mixed OR any pill bottle that is already opened/singular)
      // Note: We treat pills as active if they are unique or the user has started taking them.
      if (v.status === 'mixed' || v.status === 'pill') {
        active.push({ vial: v, count: 1, ids: [v.id] });
      } else {
        // 2. Logic for Stockpile (Dry Powder)
        const compoundsKey = (v.compounds || []).map(c => `${c.name}:${c.mass_mg}:${c.unit || 'mg'}`).join('|');
        const key = `${v.status}-${compoundsKey}`;
        if (!stockpileGroups[key]) stockpileGroups[key] = { vial: v, count: 0, ids: [] };
        stockpileGroups[key].count++;
        stockpileGroups[key].ids.push(v.id);
      }
    });

    return { active, stockpile: Object.values(stockpileGroups) };
  }, [rawVials]);

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const val = parseFloat(volume);
    const finalName = vialName || compounds.map(c => c.name).join(' / ');

    for (let i = 0; i < vialCount; i++) {
      await rep.mutate.createVial({
        id: nanoid(),
        name: finalName,
        compounds,
        volume_ml: status === 'mixed' ? val : 0,
        remaining_volume_ml: status === 'mixed' ? val : 0,
        status,
        pill_count: status === 'pill' ? Math.floor(val) : undefined,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. ACTIVE PROTOCOL SECTION */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title" style={{ color: 'var(--primary)' }}><Activity className="h-5 w-5" /> Active Protocol</h3>
            <p className="card-description">Currently mixed or in-use</p>
          </div>
          <button onClick={() => { setIsAdding(!isAdding); setEditingVial(null); }} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {inventory.active.length === 0 && !isAdding && (
              <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem', padding: '1rem' }}>No active compounds. Add or reconstitute from stockpile.</p>
            )}
            
            {/* ADD FORM (Integrated) */}
            {(isAdding || editingVial) && (
              <form onSubmit={editingVial ? handleUpdateVial : handleAddVial} style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', background: 'rgba(37, 99, 235, 0.02)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>{editingVial ? `Editing ${editingVial.name}` : 'New Inventory Item'}</h4>
                <div className="form-group"><label className="form-label">Label</label><input className="form-input" value={editingVial ? editingVial.name : vialName} onChange={e => editingVial ? setEditingVial({...editingVial, name: e.target.value}) : setVialName(e.target.value)} /></div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Compounds</label>
                  {(editingVial ? editingVial.compounds : compounds).map((c, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px 30px', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <input className="form-input" value={c.name} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].name = e.target.value; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} required />
                      <input className="form-input" type="number" value={c.mass_mg || ""} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].mass_mg = parseFloat(e.target.value); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} required />
                      <select className="form-input" value={c.unit || 'mg'} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].unit = e.target.value as any; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}><option value="mg">mg</option><option value="IU">IU</option></select>
                      <button type="button" onClick={() => { const n = (editingVial ? editingVial.compounds : compounds).filter((_, i) => i !== idx); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} className="btn btn-outline" style={{ border: 'none' }} disabled={(editingVial ? editingVial.compounds : compounds).length === 1}><X className="h-4 w-4 text-destructive" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { const n = [...(editingVial ? editingVial.compounds : compounds), { name: "", mass_mg: 0, unit: 'mg' as const }]; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} className="btn btn-outline" style={{ width: '100%', fontSize: '0.7rem' }}><PlusCircle className="h-3 w-3 mr-2" /> Add Blend</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">State</label><select className="form-input" value={editingVial ? editingVial.status : status} onChange={e => { const s = e.target.value as any; editingVial ? setEditingVial({...editingVial, status: s}) : setStatus(s); }}><option value="powder">Powder (Dry)</option><option value="mixed">Mixed (Liquid)</option><option value="pill">Pill (Oral)</option></select></div>
                  {!editingVial && <div className="form-group"><label className="form-label">Quantity</label><input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} /></div>}
                </div>

                <div className="form-group">
                  <label className="form-label">{(editingVial ? editingVial.status : status) === 'pill' ? 'Pill Count' : 'Total Vol (mL)'}</label>
                  <input className="form-input" type="number" step="0.1" 
                    value={editingVial ? (editingVial.status === 'pill' ? editingVial.pill_count : editingVial.volume_ml) : volume} 
                    onChange={e => editingVial ? (editingVial.status === 'pill' ? setEditingVial({...editingVial, pill_count: parseInt(e.target.value)}) : setEditingVial({...editingVial, volume_ml: parseFloat(e.target.value), remaining_volume_ml: parseFloat(e.target.value)})) : setVolume(e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingVial ? 'Save Changes' : 'Add to Inventory'}</button>
                  {editingVial && <button type="button" onClick={() => setEditingVial(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>}
                </div>
              </form>
            )}

            {inventory.active.map(group => (
              <div key={group.vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', background: group.vial.status === 'mixed' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>{group.vial.status === 'mixed' ? <Droplets className="h-4 w-4 text-primary" /> : <CircleDot className="h-4 w-4 text-success" />}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{group.vial.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')} | {group.vial.status === 'mixed' ? `${group.vial.remaining_volume_ml.toFixed(2)}mL rem.` : `${group.vial.pill_count} pills rem.`}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => setLoggingVial(loggingVial?.id === group.vial.id ? null : group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Log Dose"><Syringe className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => { setEditingVial(group.vial); setIsAdding(false); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Edit"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={async () => { if(confirm("Delete item?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
                {loggingVial?.id === group.vial.id && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>{group.vial.status === 'pill' ? 'Take Pill' : 'Record Injection'}</p>
                    {group.vial.status === 'mixed' && group.vial.compounds.length > 1 && (
                      <select className="form-input" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} value={targetCompoundIndex} onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}>{group.vial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}</select>
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

      {/* 2. STRATEGIC STOCKPILE SECTION */}
      <div className="card" style={{ borderStyle: 'dashed', opacity: 0.8 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--muted-foreground)' }}><Archive className="h-5 w-5" /> Strategic Stockpile</h3>
          <p className="card-description">Unopened or reserve inventory</p>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {inventory.stockpile.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Stockpile empty.</p>
            )}
            {inventory.stockpile.map(group => (
              <div key={group.vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{group.vial.name} <span style={{ color: 'var(--primary)' }}>x{group.count}</span></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => { setEditingVial(group.vial); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline" style={{ padding: '0.15rem', border: 'none' }} title="Mix/Edit"><Edit3 className="h-3 w-3" /></button>
                    <button onClick={async () => { if(confirm("Delete stockpile?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ padding: '0.15rem', border: 'none' }} title="Delete"><Trash2 className="h-3 w-3 text-destructive" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
