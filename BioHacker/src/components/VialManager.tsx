"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot, Archive, Activity, Calendar, MapPin, Clock } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound, Protocol } from "@/replicache";
import { calculateRequiredUnits } from "@/math";
import Decimal from "decimal.js";
import { format } from "date-fns";
import { COMPOUND_DATABASE } from "@/lib/compoundsDb";

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
  const [activePreset, setActivePreset] = useState('custom');
  
  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [schedulingVial, setSchedulingVial] = useState<Vial | null>(null);
  
  // Protocol Form
  const [doseAmount, setDoseAmount] = useState("250");
  const [frequency, setFrequency] = useState("24");
  const [frequencyType, setFrequencyType] = useState('daily');
  const [daysOn, setDaysOn] = useState("7");
  const [daysOff, setDaysOff] = useState("0");
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [timeBuckets, setTimeBuckets] = useState<('morning' | 'afternoon' | 'night')[]>([]);
  const [preferredStartTime, setPreferredStartTime] = useState("08:00");
  
  // Logging State
  const [targetCompoundIndex, setTargetCompoundIndex] = useState(0);
  const [injectionSite, setInjectionSite] = useState("Abdomen (Left)");

  const INJECTION_SITES = [
    "Abdomen (Left)", "Abdomen (Right)", "Glute (Left)", "Glute (Right)", 
    "Thigh (Left)", "Thigh (Right)", "Deltoid (Left)", "Deltoid (Right)"
  ];

  const rep = getReplicache(userId);
  const rawVials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const protocols = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "protocol/" }).values().toArray();
    return list as Protocol[];
  }, { default: [] });

  useEffect(() => {
    if (externalLoggingVialId) {
      const vial = rawVials.find(v => v.id === externalLoggingVialId);
      if (vial) {
        setLoggingVial(vial); setEditingVial(null); setIsAdding(false);
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
      const protocol = protocols.find(p => p.vial_id === v.id);
      if (v.status === 'mixed' || v.status === 'pill' || (v.status === 'powder' && protocol)) {
        active.push({ vial: v, count: 1, ids: [v.id], protocol });
      } else {
        const compoundsKey = (v.compounds || []).map(c => `${c.name}:${c.mass_mg}:${c.unit || 'mg'}`).join('|');
        const key = `${v.status}-${compoundsKey}`;
        if (!stockpileGroups[key]) stockpileGroups[key] = { vial: v, count: 0, ids: [] };
        stockpileGroups[key].count++; stockpileGroups[key].ids.push(v.id);
      }
    });
    return { active, stockpile: Object.values(stockpileGroups) };
  }, [rawVials, protocols]);

  const getDoseUnitLabel = (vial: Vial, idx: number) => {
    if (vial.status === 'pill') return 'pills';
    const c = vial.compounds[idx];
    if (c.unit === 'mg') return 'mcg';
    if (c.unit === 'g') return 'mg';
    return 'IU';
  };

  const handleAddVial = async (e: React.FormEvent) => {
    e.preventDefault(); if (!rep) return;
    const val = parseFloat(volume);
    
    let finalName = "";
    if (activePreset === 'wolverine') finalName = "Wolverine Protocol";
    else if (activePreset === 'mass') finalName = "Mass Builder Stack";
    else if (activePreset === 'shred') finalName = "Shredding Stack";
    else finalName = compounds.map(c => c.name).filter(Boolean).join(' / ') || 'Unknown Compound';

    for (let i = 0; i < (parseInt(count) || 1); i++) {
      await rep.mutate.createVial({
        id: crypto.randomUUID(), name: finalName, compounds, volume_ml: status === 'mixed' ? val : 0,
        remaining_volume_ml: status === 'mixed' ? val : 0, status,
        pill_count: status === 'pill' ? Math.floor(val) : undefined,
      });
    }
    setIsAdding(false); setActivePreset('custom'); setVialName(""); setCompounds([{ name: "", mass_mg: 0, unit: 'mg' }]);
  };

  const handleUpdateVial = async (e: React.FormEvent) => {
    e.preventDefault(); if (!rep || !editingVial) return;
    await rep.mutate.updateVial(editingVial);
    setEditingVial(null);
  };

  const handleSaveProtocol = async (vialId: string) => {
    if (!rep) return;
    const existing = protocols.find(p => p.vial_id === vialId);
    if (existing) await rep.mutate.deleteProtocol(existing.id);

    const [hours, minutes] = preferredStartTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    await rep.mutate.createProtocol({
      id: crypto.randomUUID(), vial_id: vialId, dose_amount: parseFloat(doseAmount),
      frequency_hours: parseFloat(frequency), 
      days_on: parseInt(daysOn),
      days_off: parseInt(daysOff),
      skip_weekends: skipWeekends,
      time_buckets: timeBuckets,
      start_time: start.getTime(),
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
      id: crypto.randomUUID(), vial_id: vial.id, substance: `${vial.name} (${compound.name})`,
      dose_amount: amount, unit: getDoseUnitLabel(vial, compoundIdx), units_iu, timestamp: Date.now(),
      injection_site: vial.status === 'mixed' ? injectionSite : undefined
    });
    setLoggingVial(null); if (onLoggingComplete) onLoggingComplete();
  };

  const toggleBucket = (bucket: 'morning' | 'afternoon' | 'night') => {
    if (timeBuckets.includes(bucket)) {
      setTimeBuckets(timeBuckets.filter(b => b !== bucket));
    } else {
      setTimeBuckets([...timeBuckets, bucket]);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* FORM HUB */}
      {(isAdding || editingVial || loggingVial) && (
        <div className="card border-primary bg-primary/5">
          <div className="card-header flex justify-between items-center pb-4">
            <h3 className="card-title text-primary font-bold">
              {editingVial ? `Edit ${editingVial.name}` : loggingVial ? `Log Dose: ${loggingVial.name}` : 'New Inventory Item'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingVial(null); setLoggingVial(null); if(onLoggingComplete) onLoggingComplete(); }} className="btn btn-outline border-transparent hover:bg-muted/30 p-2"><X className="h-5 w-5" /></button>
          </div>
          <div className="card-content space-y-4">
            {loggingVial ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group"><label className="form-label">Dose ({getDoseUnitLabel(loggingVial, targetCompoundIndex)})</label><input className="form-input" type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Compound</label>
                    <select className="form-input" value={targetCompoundIndex} onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}>
                      {loggingVial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                {loggingVial.status === 'mixed' && (
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2"><MapPin className="h-3 w-3" /> Injection Site</label>
                    <select className="form-input" value={injectionSite} onChange={e => setInjectionSite(e.target.value)}>
                      {INJECTION_SITES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={() => handleLogDose(loggingVial, parseFloat(doseAmount), targetCompoundIndex)} className="btn btn-primary w-full">Record Administration</button>
              </div>
            ) : (
              <form onSubmit={editingVial ? (e) => { e.preventDefault(); handleUpdateVial(e); } : handleAddVial} className="space-y-5">
                
                {!editingVial && (
                  <div className="form-group mb-2">
                    <label className="form-label">Quick Stack Presets</label>
                    <select 
                      className="form-input w-full bg-[#09090b] text-sm py-2" 
                      value={activePreset} 
                      onChange={e => {
                        const val = e.target.value;
                        setActivePreset(val);
                        if (val === 'wolverine') {
                          setCompounds([{name: 'BPC-157', mass_mg: 5, unit: 'mg'}, {name: 'TB-500', mass_mg: 5, unit: 'mg'}]);
                        } else if (val === 'mass') {
                          setCompounds([{name: 'Testosterone Cypionate', mass_mg: 200, unit: 'mg'}, {name: 'Nandrolone Decanoate', mass_mg: 100, unit: 'mg'}]);
                        } else if (val === 'shred') {
                          setCompounds([{name: 'Tirzepatide', mass_mg: 5, unit: 'mg'}, {name: 'AOD-9604', mass_mg: 2, unit: 'mg'}]);
                        } else {
                          setCompounds([{ name: "", mass_mg: 0, unit: 'mg' }]);
                        }
                      }}
                    >
                      <option value="custom">Custom Configuration</option>
                      <option value="wolverine">Wolverine (BPC-157 + TB-500)</option>
                      <option value="mass">Mass Builder (Test C + Deca)</option>
                      <option value="shred">Shredding (Tirzepatide + AOD)</option>
                    </select>
                  </div>
                )}
                
                <div className="space-y-3">
                  <label className="form-label block border-b border-border pb-2">Compounds</label>
                  
                  {/* Native Autocomplete Datalist */}
                  <datalist id="compounds-list">
                    {COMPOUND_DATABASE.map((comp) => (
                      <option key={comp} value={comp} />
                    ))}
                  </datalist>

                  {(editingVial ? editingVial.compounds : compounds).map((c, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center p-4 sm:p-0 bg-[#18181b]/50 sm:bg-transparent rounded-lg border border-[#27272a] sm:border-none relative">
                      
                      {/* Name Row: Full width on mobile, flex-1 on desktop */}
                      <div className="flex-1 w-full">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block sm:hidden">Compound Name</label>
                        <input list="compounds-list" className="form-input w-full bg-[#09090b]" value={c.name} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].name = e.target.value; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} placeholder="Search Database..." required />
                      </div>
                      
                      {/* Mass/Unit Row: 50/50 Grid on Mobile, fixed widths on desktop */}
                      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-2">
                        <div className="w-full sm:w-24">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block sm:hidden">Mass/Amount</label>
                          <input className="form-input w-full bg-[#09090b]" type="number" step="any" value={c.mass_mg || ""} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].mass_mg = parseFloat(e.target.value); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} placeholder="Amt" required />
                        </div>
                        
                        <div className="w-full sm:w-20">
                          <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block sm:hidden">Unit</label>
                          <select className="form-input w-full bg-[#09090b] px-2" value={c.unit || 'mg'} onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].unit = e.target.value as any; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}>
                            <option value="mg">mg</option><option value="g">g</option><option value="IU">IU</option>
                          </select>
                        </div>
                      </div>

                      <button type="button" onClick={() => { const n = (editingVial ? editingVial.compounds : compounds).filter((_, i) => i !== idx); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} className="btn btn-outline border-[#27272a] hover:bg-destructive/10 hover:text-destructive hover:border-destructive w-full sm:w-10 sm:p-1 mt-1 sm:mt-0" disabled={(editingVial ? editingVial.compounds : compounds).length === 1}>
                        <span className="sm:hidden font-bold text-xs flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" /> Remove Compound</span>
                        <X className="h-4 w-4 mx-auto hidden sm:block" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { const n = [...(editingVial ? editingVial.compounds : compounds), { name: "", mass_mg: 0, unit: 'mg' as const }]; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }} className="btn btn-outline w-full sm:w-auto border-dashed hover:border-primary text-xs py-1 mt-2">
                    <PlusCircle className="h-3 w-3 mr-2" /> Add Blend
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="form-group"><label className="form-label">State</label><select className="form-input" value={editingVial ? editingVial.status : status} onChange={e => { const s = e.target.value as any; editingVial ? setEditingVial({...editingVial, status: s}) : setStatus(s); }}><option value="powder">Powder (Dry)</option><option value="mixed">Mixed (Liquid)</option><option value="pill">Pill (Oral)</option></select></div>
                  {!editingVial && <div className="form-group"><label className="form-label">Quantity</label><input className="form-input" type="number" value={count} onChange={e => setCount(e.target.value)} /></div>}
                </div>
                {(editingVial ? editingVial.status : status) !== 'powder' && (
                  <div className="form-group"><label className="form-label">{(editingVial ? editingVial.status : status) === 'pill' ? 'Pill Count' : 'Total Vol (mL)'}</label>
                    <input className="form-input" type="number" step="0.1" value={editingVial ? (editingVial.status === 'pill' ? editingVial.pill_count : editingVial.volume_ml) : volume} onChange={e => editingVial ? (editingVial.status === 'pill' ? setEditingVial({...editingVial, pill_count: parseInt(e.target.value)}) : setEditingVial({...editingVial, volume_ml: parseFloat(e.target.value), remaining_volume_ml: parseFloat(e.target.value)})) : setVolume(e.target.value)} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-full mt-4">{editingVial ? 'Apply Changes' : 'Save Item'}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE PROTOCOL SECTION */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div><h3 className="card-title text-primary flex items-center gap-2"><Activity className="h-5 w-5" /> Active Protocol</h3></div>
          <button onClick={() => { setIsAdding(true); setEditingVial(null); setLoggingVial(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-primary px-3 py-1 text-xs"><Plus className="h-3 w-3 sm:h-4 sm:w-4" /></button>
        </div>
        <div className="card-content">
          <div className="flex flex-col gap-3">
            {inventory.active.map(group => (
              <div key={group.vial.id} className="p-3 lg:p-4 bg-background rounded-xl border border-border flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex gap-3 items-start sm:items-center">
                    <div className="p-2 sm:p-3 rounded-xl flex-shrink-0" style={{ background: group.vial.status === 'mixed' ? 'rgba(37, 99, 235, 0.1)' : group.vial.status === 'pill' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(161, 161, 170, 0.1)' }}>
                      {group.vial.status === 'mixed' ? <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> : group.vial.status === 'pill' ? <CircleDot className="h-4 w-4 sm:h-5 sm:w-5 text-success" /> : <Beaker className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-base sm:text-lg truncate">{group.vial.name}</div>
                      <div className="text-xs text-muted-foreground truncate leading-relaxed">
                        {(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                    <button onClick={() => { setLoggingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex-1 sm:flex-none btn btn-outline bg-primary/5 hover:bg-primary/10 border-primary/20 p-2 sm:px-3" title="Log Dose">
                      <Syringe className="h-4 w-4 text-primary mx-auto" />
                    </button>
                    <button onClick={() => { setSchedulingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); const f = group.protocol?.frequency_hours || 24; setFrequency(f.toString()); setFrequencyType(f === 168 ? 'weekly' : f === 24 ? 'daily' : 'custom'); setDaysOn(group.protocol?.days_on?.toString() || "7"); setDaysOff(group.protocol?.days_off?.toString() || "0"); setSkipWeekends(group.protocol?.skip_weekends || false); setTimeBuckets(group.protocol?.time_buckets || []); }} className="flex-1 sm:flex-none btn btn-outline bg-success/5 hover:bg-success/10 border-success/20 p-2 sm:px-3" title="Set Protocol">
                      <Calendar className="h-4 w-4 text-success mx-auto" />
                    </button>
                    <button onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline p-2 border-border" title="Edit">
                      <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={async () => {
                      if (confirm(`Permanently delete ${group.vial.name}?`)) {
                        if (group.protocol) await rep?.mutate.deleteProtocol(group.protocol.id);
                        await rep?.mutate.deleteVial(group.vial.id);
                      }
                    }} className="btn btn-outline p-2 border-border text-destructive hover:bg-destructive/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {group.protocol && (
                  <div className="flex flex-wrap gap-1">
                    <div className="text-[10px] uppercase font-bold text-primary bg-primary/5 p-1 rounded">
                      {group.protocol.dose_amount}{getDoseUnitLabel(group.vial, 0)} every {group.protocol.frequency_hours}h
                    </div>
                    {group.protocol.skip_weekends && <div className="text-[10px] uppercase font-bold text-orange-500 bg-orange-500/5 p-1 rounded">No Weekends</div>}
                    {group.protocol.time_buckets?.map(b => (
                      <div key={b} className="text-[10px] uppercase font-bold text-success bg-success/5 p-1 rounded">{b}</div>
                    ))}
                    <button 
                      onClick={async () => {
                        if (confirm('Delete this protocol schedule?')) {
                          await rep?.mutate.deleteProtocol(group.protocol!.id);
                        }
                      }}
                      className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Delete Protocol"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {schedulingVial?.id === group.vial.id && (
                  <div className="mt-2 p-3 bg-success/5 rounded border border-success space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold uppercase text-success">Protocol Settings</p>
                      <button onClick={() => setSchedulingVial(null)}><X className="h-3 w-3 text-muted-foreground"/></button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group"><label className="form-label text-[10px]">Amount</label><input className="form-input text-xs bg-[#09090b] border-border" type="number" value={doseAmount} onChange={e => setDoseAmount(e.target.value)} /></div>
                      <div className="form-group">
                        <label className="form-label text-[10px]">Frequency</label>
                        <select 
                          className="form-input text-xs bg-[#09090b] border-border py-2 h-full" 
                          value={frequencyType} 
                          onChange={e => {
                            const val = e.target.value;
                            setFrequencyType(val);
                            if (val === 'daily') setFrequency("24");
                            else if (val === 'weekly') setFrequency("168");
                          }}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="custom">Custom Hours</option>
                        </select>
                      </div>
                    </div>

                    {frequencyType === 'custom' && (
                      <div className="form-group mt-2">
                        <label className="form-label text-[10px]">Custom Frequency (Hours)</label>
                        <input className="form-input text-xs bg-[#09090b] border-border" type="number" value={frequency} onChange={e => setFrequency(e.target.value)} />
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Schedule Pattern</label>
                      <div className="flex items-center gap-3 p-3 bg-[#09090b] border border-border rounded-md">
                        <input type="checkbox" checked={skipWeekends} onChange={e => setSkipWeekends(e.target.checked)} className="h-5 w-5 rounded border-border bg-background accent-primary flex-shrink-0" />
                        <span className="text-sm font-semibold">Skip Weekends (Mon-Fri)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Time Slots (Select multiple)</label>
                      <div className="flex gap-2">
                        {['morning', 'afternoon', 'night'].map((b: any) => (
                          <button 
                            key={b} 
                            type="button"
                            onClick={() => toggleBucket(b)}
                            className={`flex-[1_1_0%] text-[10px] uppercase font-bold py-3 rounded-md border-2 transition-colors ${timeBuckets.includes(b) ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-[#09090b] text-muted-foreground border-border hover:border-primary/50'}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="form-group"><label className="form-label text-[10px]">Start Time</label><input className="form-input text-xs bg-[#09090b] border-border py-2 px-1 text-center" type="time" value={preferredStartTime} onChange={e => setPreferredStartTime(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label text-[10px]">Days ON</label><input className="form-input text-xs bg-[#09090b] border-border py-2 text-center" type="number" value={daysOn} onChange={e => setDaysOn(e.target.value)} /></div>
                      <div className="form-group"><label className="form-label text-[10px]">Days OFF</label><input className="form-input text-xs bg-[#09090b] border-border py-2 text-center" type="number" value={daysOff} onChange={e => setDaysOff(e.target.value)} /></div>
                    </div>
                    <button onClick={() => handleSaveProtocol(group.vial.id)} className="btn btn-primary w-full bg-success text-sm py-3 mt-2 font-bold shadow-lg shadow-success/20">Save Clinical Protocol</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STOCKPILE */}
      <div className="card border-dashed opacity-80">
        <div className="card-header flex justify-between items-center">
          <div><h3 className="card-title text-muted-foreground flex items-center gap-2"><Archive className="h-5 w-5" /> Strategic Stockpile</h3></div>
          <button onClick={() => { setIsAdding(true); setEditingVial(null); setLoggingVial(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline px-3 py-1"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inventory.stockpile.map(group => (
              <div key={group.vial.id} className="p-3 bg-background rounded-lg border border-border flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">{group.vial.name} <span className="text-primary">x{group.count}</span></div>
                  <div className="text-[10px] text-muted-foreground uppercase">{(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="btn btn-outline border-none p-1 text-muted-foreground hover:text-foreground"><Edit3 className="h-3 w-3" /></button>
                  <button onClick={async () => {
                    if (confirm(`Permanently delete all ${group.count} ${group.vial.name} items?`)) {
                      for (const id of group.ids) await rep?.mutate.deleteVial(id);
                    }
                  }} className="btn btn-outline border-none p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete All"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

