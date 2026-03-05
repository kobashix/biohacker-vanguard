"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot, Archive, Activity, Calendar } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound, Protocol } from "@/replicache";
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
  
  // UI States
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [schedulingVial, setSchedulingVial] = useState<Vial | null>(null);
  
  // Protocol Form State
  const [doseAmount, setDoseAmount] = useState("2");
  const [frequency, setFrequency] = useState("24");

  const rep = getReplicache(userId);
  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const protocols = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "protocol/" }).values().toArray();
    return list as Protocol[];
  }, { default: [] });

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
    setIsAdding(false);
  };

  const handleSaveProtocol = async (vialId: string) => {
    if (!rep) return;
    // Clear existing protocol for this vial
    const existing = protocols.find(p => p.vial_id === vialId);
    if (existing) await rep.mutate.deleteProtocol(existing.id);

    await rep.mutate.createProtocol({
      id: nanoid(),
      vial_id: vialId,
      dose_amount: parseFloat(doseAmount),
      frequency_hours: parseFloat(frequency),
      start_time: Date.now(),
    });
    setSchedulingVial(null);
  };

  const handleLogDose = async (vial: Vial, amount: number) => {
    if (!rep) return;
    const compound = vial.compounds[0]; // Logic for first compound
    let units_iu = 0;
    if (vial.status === 'mixed') {
      units_iu = calculateRequiredUnits(compound.mass_mg, vial.volume_ml, amount).toNumber();
    }
    await rep.mutate.logDose({
      id: nanoid(), vial_id: vial.id, substance: vial.name,
      dose_mcg: amount, units_iu, timestamp: Date.now(),
    });
    setLoggingVial(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 className="card-title" style={{ color: 'var(--primary)' }}><Activity className="h-5 w-5" /> Active Protocol</h3></div>
          <button onClick={() => { setIsAdding(!isAdding); setEditingVial(null); }} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}><Plus className="h-4 w-4" /></button>
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
                      {group.protocol ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500 }}>
                          Protocol: {group.protocol.dose_amount}{group.vial.status === 'pill' ? ' pills' : 'mcg'} every {group.protocol.frequency_hours}h
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>No protocol set</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => setLoggingVial(loggingVial?.id === group.vial.id ? null : group.vial)} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Log Dose"><Syringe className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => { setSchedulingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "2"); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Set Protocol"><Calendar className="h-4 w-4 text-success" /></button>
                    <button onClick={() => { setEditingVial(group.vial); setIsAdding(false); }} className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} title="Edit"><Edit3 className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* PROTOCOL SCHEDULER FORM */}
                {schedulingVial?.id === group.vial.id && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--success)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Set Dosing Protocol</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group"><label className="form-label" style={{fontSize: '0.7rem'}}>Dose ({group.vial.status === 'pill' ? 'Pills' : 'mcg'})</label><input className="form-input" type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label" style={{fontSize: '0.7rem'}}>Every (Hours)</label><input className="form-input" type="number" value={frequency} onChange={e => setFrequency(e.target.value)} /></div>
                    </div>
                    <button onClick={() => handleSaveProtocol(group.vial.id)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem', background: 'var(--success)' }}>Save Protocol</button>
                  </div>
                )}

                {/* QUICK LOG FORM */}
                {loggingVial?.id === group.vial.id && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
                    <button onClick={() => handleLogDose(group.vial, group.protocol?.dose_amount || 250)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>
                      Log {group.protocol ? `${group.protocol.dose_amount}${group.vial.status === 'pill' ? ' pills' : 'mcg'}` : 'Default Dose'} Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ borderStyle: 'dashed', opacity: 0.8 }}>
        <div className="card-header"><h3 className="card-title" style={{ color: 'var(--muted-foreground)' }}><Archive className="h-5 w-5" /> Strategic Stockpile</h3></div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {inventory.stockpile.map(group => (
              <div key={group.vial.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{group.vial.name} <span>x{group.count}</span></div></div>
                <button onClick={() => { setEditingVial(group.vial); setIsAdding(false); }} className="btn btn-outline" style={{ border: 'none' }}><Edit3 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
