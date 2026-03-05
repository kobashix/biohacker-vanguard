"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot, Archive, Activity, Calendar } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound, Protocol } from "@/replicache";
import { nanoid } from "nanoid";
import { calculateRequiredUnits } from "@/math";
import Decimal from "decimal.js";

interface VialManagerProps {
  userId: string;
  externalLoggingVialId?: string | null;
  onLoggingComplete?: () => void;
}

export function VialManager({ userId, externalLoggingVialId, onLoggingComplete }: VialManagerProps) {
  const [vialName, setVialName] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([{ name: "", mass_mg: 0, unit: 'mg' }]);
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'powder' | 'mixed' | 'pill'>('powder');
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [schedulingVial, setSchedulingVial] = useState<Vial | null>(null);
  
  const [doseAmount, setDoseAmount] = useState("250");
  const [frequency, setFrequency] = useState("24");
  const [targetCompoundIndex, setTargetCompoundIndex] = useState(0);

  const rep = getReplicache(userId);
  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const protocols = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "protocol/" }).values().toArray();
    return list as Protocol[];
  }, { default: [] });

  // Respond to external triggers from the Calendar
  useEffect(() => {
    if (externalLoggingVialId) {
      const vial = rawVials.find(v => v.id === externalLoggingVialId);
      if (vial) {
        setLoggingVial(vial);
        setEditingVial(null);
        setIsAdding(false);
        const protocol = protocols.find(p => p.vial_id === vial.id);
        if (protocol) setDoseAmount(protocol.dose_amount.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [externalLoggingVialId, rawVials, protocols]);

  const inventory = useMemo(() => {
    const active: { vial: Vial; count: number; ids: string[]; protocol?: Protocol }[] = [];
    const stockpileGroups: Record<string, { vial: Vial; count: number; ids: string[] }> = {};

    rawVials.forEach(v => {
      if (v.status === 'mixed' || v.status === 'pill') {
        const protocol = protocols.find(p => p.vial_id === v.id);
        active.push({ vial: v, count: 1, ids: [v.id], protocol });
      } else {
        const compoundsKey = (v.compounds || []).map(c => `${c.name}:${c.mass_mg}:${c.unit || 'mg'}`).join('|');
        const key = `${v.status}-${compoundsKey}`;
        if (!stockpileGroups[key]) stockpileGroups[key] = { vial: v, count: 0, ids: [] };
        stockpileGroups[key].count++;
        stockpileGroups[key].ids.push(v.id);
      }
    });
    return { active, stockpile: Object.values(stockpileGroups) };
  }, [rawVials, protocols]);

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    const vialCount = parseInt(count) || 1;
    const val = parseFloat(volume);
    const finalName = vialName || compounds.map(c => c.name).join(' / ');
    for (let i = 0; i < vialCount; i++) {
      await rep.mutate.createVial({
        id: nanoid(), name: finalName, compounds, volume_ml: status === 'mixed' ? val : 0,
        remaining_volume_ml: status === 'mixed' ? val : 0, status,
        pill_count: status === 'pill' ? Math.floor(val) : undefined,
      });
    }
    setIsAdding(false); setVialName(""); setCompounds([{ name: "", mass_mg: 0, unit: 'mg' }]);
  };

  const handleUpdateVial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep || !editingVial) return;
    await rep.mutate.updateVial(editingVial);
    setEditingVial(null);
  };

  const handleSaveProtocol = async (vialId: string) => {
    if (!rep) return;
    const existing = protocols.find(p => p.vial_id === vialId);
    if (existing) await rep.mutate.deleteProtocol(existing.id);
    await rep.mutate.createProtocol({
      id: nanoid(), vial_id: vialId, dose_amount: parseFloat(doseAmount),
      frequency_hours: parseFloat(frequency), start_time: Date.now(),
    });
    setSchedulingVial(null);
  };

  const handleLogDose = async (vial: Vial, amount: number, compoundIdx: number) => {
    if (!rep) return;
    const compound = vial.compounds[compoundIdx];
    let units_iu = 0;
    if (vial.status === 'mixed') {
      units_iu = calculateRequiredUnits(compound.mass_mg, vial.volume_ml, amount, compound.unit).toNumber();
    }
    await rep.mutate.logDose({
      id: nanoid(), vial_id: vial.id, substance: `${vial.name} (${compound.name})`,
      dose_mcg: amount, units_iu, timestamp: Date.now(),
    });
    setLoggingVial(null);
    if (onLoggingComplete) onLoggingComplete();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* GLOBAL FORM */}
      {(isAdding || editingVial || loggingVial) && (
        <div className="card" style={{ border: '1px solid var(--primary)', background: 'rgba(37, 99, 235, 0.02)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              {editingVial ? `Edit ${editingVial.name}` : loggingVial ? `Log Dose: ${loggingVial.name}` : 'New Inventory Item'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingVial(null); setLoggingVial(null); if(onLoggingComplete) onLoggingComplete(); }} className="btn btn-outline" style={{ border: 'none' }}><X className="h-5 w-5" /></button>
          </div>
          <div className="card-content">
            {loggingVial ? (
              <div style={{ padding: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div className="form-group"><label className="form-label">Dose ({loggingVial.status === 'pill' ? 'Pills' : 'mcg'})</label><input className="form-input" type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Compound</label>
                    <select className="form-input" value={targetCompoundIndex} onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}>
                      {loggingVial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => handleLogDose(loggingVial, parseFloat(doseAmount), targetCompoundIndex)} className="btn btn-primary" style={{ width: '100%' }}>Confirm Dose Recording</button>
              </div>
            ) : (
              <form onSubmit={editingVial ? handleUpdateVial : handleAddVial}>
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
                {(editingVial ? editingVial.status : status) !== 'powder' && (
                  <div className="form-group"><label className="form-label">{(editingVial ? editingVial.status : status) === 'pill' ? 'Pill Count' : 'Total Vol (mL)'}</label>
                    <input className="form-input" type="number" step="0.1" value={editingVial ? (editingVial.status === 'pill' ? editingVial.pill_count : editingVial.volume_ml) : volume} onChange={e => editingVial ? (editingVial.status === 'pill' ? setEditingVial({...editingVial, pill_count: parseInt(e.target.value)}) : setEditingVial({...editingVial, volume_ml: parseFloat(e.target.value), remaining_volume_ml: parseFloat(e.target.value)})) : setVolume(e.target.value)} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>{editingVial ? 'Apply Changes' : 'Save Item'}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE PROTOCOL SECTION */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 className="card-title" style={{ color: 'var(--primary)' }}><Activity className="h-5 w-5" /> Active Protocol</h3></div>
          <button onClick={() => { setIsAdding(true); setEditingVial(null); setLoggingVial(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}><Plus className="h-4 w-4" /></button>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {inventory.active.map(group => (
              <div key={group.vial.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', background: group.vial.status === 'mixed' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>{group.vial.status === 'mixed' ? <Droplets className="h-4 w-4 text-primary" /> : <CircleDot className="h-4 w-4 text-success" />}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{group.vial.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => { setLoggingVial(loggingVial?.id === group.vial.id ? null : group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Log Dose"><Syringe className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => { setSchedulingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Set Protocol"><Calendar className="h-4 w-4 text-success" /></button>
                    <button onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Edit"><Edit3 className="h-4 w-4" /></button>
                  </div>
                </div>
                {schedulingVial?.id === group.vial.id && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--success)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Set Dosing Protocol</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group"><label className="form-label" style={{fontSize: '0.7rem'}}>Dose</label><input className="form-input" type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label" style={{fontSize: '0.7rem'}}>Hours</label><input className="form-input" type="number" value={frequency} onChange={e => setFrequency(e.target.value)} /></div>
                    </div>
                    <button onClick={() => handleSaveProtocol(group.vial.id)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem', background: 'var(--success)' }}>Save Protocol</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STRATEGIC STOCKPILE SECTION */}
      <div className="card" style={{ borderStyle: 'dashed', opacity: 0.8 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 className="card-title" style={{ color: 'var(--muted-foreground)' }}><Archive className="h-5 w-5" /> Strategic Stockpile</h3></div>
          <button onClick={() => { setIsAdding(true); setEditingVial(null); setLoggingVial(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}><Plus className="h-4 w-4" /></button>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {inventory.stockpile.map(group => (
              <div key={group.vial.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{group.vial.name} <span>x{group.count}</span></div></div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline" style={{ padding: '0.15rem', border: 'none' }} title="Mix/Edit"><Edit3 className="h-3 w-3" /></button>
                  <button onClick={async () => { if(confirm("Delete stockpile?")) for(const id of group.ids) await rep?.mutate.deleteVial(id) }} className="btn btn-outline" style={{ padding: '0.15rem', border: 'none' }} title="Delete"><Trash2 className="h-3 w-3 text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
