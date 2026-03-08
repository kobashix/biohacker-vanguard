"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Beaker, Droplets, Layers, Package, Edit3, Check, X, Syringe, Save, PlusCircle, CircleDot, Archive, Activity, Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Compound, Protocol } from "@/replicache";
import { calculateRequiredUnits } from "@/math";
import Decimal from "decimal.js";
import { format } from "date-fns";
import { COMPOUND_DATABASE, STACK_PRESETS } from "@/lib/compoundsDb";

// Build category groups for the compound select dropdown
const COMPOUND_GROUPS: Record<string, string[]> = {};
for (const comp of COMPOUND_DATABASE) {
  // Infer the group from the COMPOUND_DATABASE ordering comments by matching keyword patterns
  const grp =
    ['BPC','TB-500','KPV','VIP','LL-37','Thymosin Alpha','Larazotide','GHK','Epitalon','Semax','Selank','Humanin','SS-31','MOTS-c'].some(k => comp.startsWith(k)) ? 'Peptides: Recovery' :
    ['CJC','Ipamorelin','GHRP','Hexarelin','Sermorelin','Tesamorelin','AOD','HGH Frag','MK-677','HGH','IGF','PEG','MGF','Kisspeptin'].some(k => comp.includes(k)) ? 'Peptides: GH / Secretagogues' :
    ['Semaglutide','Tirzepatide','Retatrutide','Liraglutide','Cagrilintide','Tesofensine'].some(k => comp.includes(k)) ? 'Peptides: GLP-1 / Fat Loss' :
    ['Dihexa','P21','Cerebrolysin','NSI-189','Pinealon','DSIP'].some(k => comp.includes(k)) ? 'Peptides: Cognitive' :
    ['PT-141','Melanotan','Kisspeptin'].some(k => comp.includes(k)) ? 'Peptides: Sexual Health' :
    ['5-Amino','Angiotensin','Thymosin Beta-4 Frag'].some(k => comp.includes(k)) ? 'Peptides: Misc' :
    ['Ostarine','Ligandrol','RAD-140','Andarine','Cardarine','Stenabolic','YK-11','S23','LGD-3303','AC-262','ACP-105','TLB-150'].some(k => comp.includes(k)) ? 'SARMs' :
    ['Testosterone Cyp','Testosterone Enan','Testosterone Prop','Testosterone Und','Testosterone Sus','Testosterone Susp','Sustanon'].some(k => comp.includes(k)) ? 'Testosterone' :
    ['Nandrolone','Trenbolone','Masteron','Primobolan','Equipoise','Boldenone','Parabolan','EQ +','Test E + Deca','Supertest'].some(k => comp.includes(k)) ? 'Steroids: Injectable' :
    ['Oxandrolone','Stanozolol','Methandrostenolone','Oxymetholone','Halotestin','Superdrol','Turinabol','Proviron','Clenbuterol','T3','T4','Ephedrine','Albuterol','AICAR','MK-677 (Oral)'].some(k => comp.includes(k)) ? 'Steroids & Orals' :
    ['Anastrozole','Exemestane','Letrozole','Tamoxifen','Clomiphene','Raloxifene','Enclomiphene','hCG','Kisspeptin-10 (LH'].some(k => comp.includes(k)) ? 'Ancillaries / PCT / AI' :
    ['DHEA','Pregnenolone','Progesterone','Estradiol','TRT dose','Pellets'].some(k => comp.includes(k)) ? 'TRT / HRT' :
    ['Vitamin','Glutathione','NAD+','Zinc','Magnesium'].some(k => comp.includes(k)) ? 'Vitamins & IV' :
    ['Bacteriostatic','Sterile Saline'].some(k => comp.includes(k)) ? 'Reconstitution' :
    'Other';
  if (!COMPOUND_GROUPS[grp]) COMPOUND_GROUPS[grp] = [];
  COMPOUND_GROUPS[grp].push(comp);
}

// Group presets by category
const PRESET_CATEGORIES = [...new Set(STACK_PRESETS.map(p => p.category))];


interface VialManagerProps {
  userId: string;
  externalLoggingVialId?: string | null;
  externalEditingVialId?: string | null;
  onLoggingComplete?: () => void;
  initialAction?: string;
}

export function VialManager({ userId, externalLoggingVialId, externalEditingVialId, onLoggingComplete, initialAction }: VialManagerProps) {
  const [vialName, setVialName] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([{ name: "", mass_mg: 0, unit: 'mg' }]);
  const [volume, setVolume] = useState("2");
  const [count, setCount] = useState("1");
  const [status, setStatus] = useState<'powder' | 'mixed' | 'pill'>('powder');
  const [isAdding, setIsAdding] = useState(false);
  const [activePreset, setActivePreset] = useState('custom');
  
  const [bacWaterMl, setBacWaterMl] = useState("0");
  const [remainingPercent, setRemainingPercent] = useState("100");

  // Auto-open the add form if deep-linked via ?action=add
  useEffect(() => {
    if (initialAction === 'add') setIsAdding(true);
  }, [initialAction]);

  const [editingVial, setEditingVial] = useState<Vial | null>(null);
  const [loggingVial, setLoggingVial] = useState<Vial | null>(null);
  const [schedulingVial, setSchedulingVial] = useState<Vial | null>(null);
  
  // Protocol Form
  const [doseAmount, setDoseAmount] = useState("250");
  const [doseUnit, setDoseUnit] = useState("mcg");
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
      if (externalLoggingVialId === 'add') return; // Handled by initialAction fallback in DashboardPage
      const vial = rawVials.find(v => v.id === externalLoggingVialId);
      if (vial) {
        setLoggingVial(vial); setEditingVial(null); setIsAdding(false);
        const protocol = protocols.find(p => p.vial_id === vial.id);
        if (protocol) setDoseAmount(protocol.dose_amount.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [externalLoggingVialId, rawVials, protocols]);

  useEffect(() => {
    if (externalEditingVialId) {
      const vial = rawVials.find(v => v.id === externalEditingVialId);
      if (vial) {
        setEditingVial(vial); setLoggingVial(null); setIsAdding(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [externalEditingVialId, rawVials]);

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

    for (let i = 0; i < (status === 'pill' ? 1 : (parseInt(count) || 1)); i++) {
      await rep.mutate.createVial({
        id: crypto.randomUUID(), name: finalName, compounds, 
        volume_ml: status === 'mixed' ? val : 0,
        remaining_volume_ml: status === 'mixed' ? val : 0, 
        bac_water_ml: status === 'mixed' ? parseFloat(bacWaterMl) || 0 : undefined,
        remaining_percent_est: status === 'mixed' ? 100 : undefined,
        status,
        pill_count: status === 'pill' ? Math.floor(val) : undefined,
      });
    }
    setIsAdding(false); setActivePreset('custom'); setVialName(""); setCompounds([{ name: "", mass_mg: 0, unit: 'mg' }]);
    setBacWaterMl("0"); setRemainingPercent("100");
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
      dose_unit: doseUnit,
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
    const protocol = protocols.find(p => p.vial_id === vial.id);
    const compound = vial.compounds[compoundIdx];
    let units_iu = 0;
    if (vial.status === 'mixed') {
      units_iu = calculateRequiredUnits(compound.mass_mg, vial.volume_ml, amount, compound.unit, protocol?.dose_unit || getDoseUnitLabel(vial, compoundIdx)).toNumber();
    }
    await rep.mutate.logDose({
      id: crypto.randomUUID(), vial_id: vial.id, substance: `${vial.name} (${compound.name})`,
      dose_amount: amount, unit: protocol?.dose_unit || getDoseUnitLabel(vial, compoundIdx), units_iu, timestamp: Date.now(),
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
      {/* ── COMPOUND FORM SHEET ── */}
      {(isAdding || editingVial || loggingVial) && (
        <div className="sheet-overlay">
          <div className="sheet-inner">
            {/* sticky header */}
            <div className="sheet-header">
              <button
                className="sheet-back-btn"
                onClick={() => { setIsAdding(false); setEditingVial(null); setLoggingVial(null); if (onLoggingComplete) onLoggingComplete(); }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="sheet-title">
                {loggingVial ? `Log Pin — ${loggingVial.name}` : editingVial ? `Edit — ${editingVial.name}` : 'New Compound'}
              </span>
            </div>

            {/* ── LOG PIN FORM ── */}
            {loggingVial ? (
              <div>
                {loggingVial.compounds.length > 1 && (
                  <div className="sheet-section">
                    <p className="sheet-section-label">Compound</p>
                    <select
                      className="form-input"
                      style={{ background: '#18181b', fontSize: '1rem', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid #27272a' }}
                      value={targetCompoundIndex}
                      onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}
                    >
                      {loggingVial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="sheet-section">
                  <p className="sheet-section-label">Dose ({protocols.find(p => p.vial_id === loggingVial.id)?.dose_unit || getDoseUnitLabel(loggingVial, targetCompoundIndex)})</p>
                  <input
                    className="big-input"
                    type="number"
                    inputMode="decimal"
                    value={doseAmount}
                    onChange={e => setDoseAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                {loggingVial.status === 'mixed' && (
                  <div className="sheet-section">
                    <p className="sheet-section-label">Injection Site</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {INJECTION_SITES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setInjectionSite(s)}
                          style={{
                            padding: '0.75rem 0.5rem',
                            borderRadius: '0.625rem',
                            border: `2px solid ${injectionSite === s ? '#2563eb' : '#27272a'}`,
                            background: injectionSite === s ? 'rgba(37,99,235,0.15)' : '#18181b',
                            color: injectionSite === s ? '#60a5fa' : '#a1a1aa',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="sheet-cta success"
                  onClick={() => handleLogDose(loggingVial, parseFloat(doseAmount), targetCompoundIndex)}
                >
                  <Syringe className="inline h-5 w-5 mr-2" style={{ verticalAlign: 'middle' }} />
                  Log This Pin
                </button>
              </div>
            ) : (
              /* ── ADD / EDIT COMPOUND FORM ── */
              <form onSubmit={editingVial ? (e) => { e.preventDefault(); handleUpdateVial(e); } : handleAddVial}>

                {!editingVial && (
                  <div className="sheet-section">
                    <p className="sheet-section-label">Stack Presets</p>
                    <select
                      className="form-input"
                      style={{ background: '#18181b', fontSize: '0.95rem', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid #27272a' }}
                      value={activePreset}
                      onChange={e => {
                        const val = e.target.value;
                        setActivePreset(val);
                        const preset = STACK_PRESETS.find(p => p.id === val);
                        if (preset) setCompounds(preset.compounds.map(c => ({ ...c })));
                        else setCompounds([{ name: '', mass_mg: 0, unit: 'mg' }]);
                      }}
                    >
                      <option value="custom">— Custom —</option>
                      {PRESET_CATEGORIES.map(cat => (
                        <optgroup key={cat} label={cat}>
                          {STACK_PRESETS.filter(p => p.category === cat).map(p => (
                            <option key={p.id} value={p.id}>{p.emoji} {p.label} — {p.description}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}

                <datalist id="compounds-list">
                  {COMPOUND_DATABASE.map((comp) => <option key={comp} value={comp} />)}
                </datalist>

                <div className="sheet-section">
                  <p className="sheet-section-label">Compounds</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(editingVial ? editingVial.compounds : compounds).map((c, idx) => (
                      <div key={idx} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '0.875rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa' }}>Compound {idx + 1}</span>
                          {(editingVial ? editingVial.compounds : compounds).length > 1 && (
                            <button
                              type="button"
                              onClick={() => { const n = (editingVial ? editingVial.compounds : compounds).filter((_, i) => i !== idx); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}
                              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                            >Remove</button>
                          )}
                        </div>
                        {/* Compound name — Auto-complete text input */}
                        <div style={{ position: 'relative', marginBottom: '0.625rem' }}>
                          <input
                            className="form-input"
                            style={{ background: '#09090b', fontWeight: 600, width: '100%' }}
                            value={c.name}
                            onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].name = e.target.value; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}
                            placeholder="Type or select compound..."
                            list="compounds-list"
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem' }}>
                          <input
                            className="form-input"
                            style={{ background: '#09090b', textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}
                            type="number"
                            step="any"
                            inputMode="decimal"
                            value={c.mass_mg || ''}
                            onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].mass_mg = parseFloat(e.target.value); editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}
                            placeholder="Amount"
                            required
                          />
                          <select
                            className="form-input"
                            style={{ background: '#09090b', textAlign: 'center', fontWeight: 700 }}
                            value={c.unit || 'mg'}
                            onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].unit = e.target.value as any; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}
                          >
                            <option value="mg">mg</option><option value="g">g</option><option value="IU">IU</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => { const n = [...(editingVial ? editingVial.compounds : compounds), { name: '', mass_mg: 0, unit: 'mg' as const }]; editingVial ? setEditingVial({...editingVial, compounds: n}) : setCompounds(n); }}
                      style={{ border: '2px dashed #27272a', borderRadius: '0.875rem', padding: '0.875rem', color: '#a1a1aa', background: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <PlusCircle className="h-4 w-4" /> Add to Blend
                    </button>
                  </div>
                </div>

                <div className="sheet-section">
                  <p className="sheet-section-label">Form / State</p>
                  <div className="seg-control" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['powder', 'mixed', 'pill'].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`seg-btn ${(editingVial ? editingVial.status : status) === s ? 'active' : ''}`}
                        onClick={() => editingVial ? setEditingVial({...editingVial, status: s as any}) : setStatus(s as any)}
                      >
                        {s === 'powder' ? '🧪 Powder' : s === 'mixed' ? '💉 Liquid' : '💊 Pill'}
                      </button>
                    ))}
                  </div>
                </div>

                {(editingVial ? editingVial.status : status) !== 'powder' && (
                  <div className="sheet-section" style={{ display: 'grid', gridTemplateColumns: (editingVial ? editingVial.status : status) === 'mixed' ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                    <div>
                      <p className="sheet-section-label">{(editingVial ? editingVial.status : status) === 'pill' ? 'Total Pill Count' : 'Total Volume (mL)'}</p>
                      <input
                        className="big-input"
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        value={editingVial ? (editingVial.status === 'pill' ? editingVial.pill_count : editingVial.volume_ml) : volume}
                        onChange={e => editingVial
                          ? (editingVial.status === 'pill'
                            ? setEditingVial({...editingVial, pill_count: parseInt(e.target.value)})
                            : setEditingVial({...editingVial, volume_ml: parseFloat(e.target.value), remaining_volume_ml: parseFloat(e.target.value)}))
                          : setVolume(e.target.value)}
                      />
                    </div>
                    {(editingVial ? editingVial.status : status) === 'mixed' && (
                      <div>
                        <p className="sheet-section-label">BAC Water (mL)</p>
                        <input
                          className="big-input"
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          value={editingVial ? (editingVial.bac_water_ml || 0) : bacWaterMl}
                          onChange={e => editingVial
                            ? setEditingVial({...editingVial, bac_water_ml: parseFloat(e.target.value)})
                            : setBacWaterMl(e.target.value)}
                          placeholder="Diluent added"
                        />
                      </div>
                    )}
                  </div>
                )}

                {editingVial && editingVial.status === 'mixed' && (
                  <div className="sheet-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="sheet-section-label">Remaining Est. (%)</p>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>{editingVial.remaining_percent_est ?? 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={editingVial.remaining_percent_est ?? 100}
                      onChange={e => setEditingVial({...editingVial, remaining_percent_est: parseInt(e.target.value)})}
                      style={{ width: '100%', accentColor: '#2563eb', marginTop: '0.5rem' }}
                    />
                  </div>
                )}

                {!editingVial && status !== 'pill' && (
                  <div className="sheet-section">
                    <p className="sheet-section-label">Quantity to Add</p>
                    <input className="big-input" type="number" inputMode="numeric" value={count} onChange={e => setCount(e.target.value)} />
                  </div>
                )}

                <button type="submit" className="sheet-cta">
                  {editingVial ? 'Save Changes' : 'Add to Inventory'}
                </button>
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
                      {group.vial.status === 'mixed' && (
                        <div className="text-[10px] text-muted-foreground mt-1 flex gap-2 font-medium">
                          {group.vial.bac_water_ml ? <span className="bg-muted px-1.5 py-0.5 rounded text-blue-400">💧 {group.vial.bac_water_ml}mL BAC</span> : null}
                          <span className="bg-muted px-1.5 py-0.5 rounded text-primary border border-primary/20">{group.vial.remaining_percent_est ?? 100}% Remaining</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                    <button onClick={() => { setLoggingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex-1 sm:flex-none btn btn-outline bg-primary/5 hover:bg-primary/10 border-primary/20 p-2 sm:px-3" title="Log Dose">
                      <Syringe className="h-4 w-4 text-primary mx-auto" />
                    </button>
                    <button onClick={() => { 
                      setSchedulingVial(group.vial); 
                      setDoseAmount(group.protocol?.dose_amount.toString() || "250"); 
                      const f = group.protocol?.frequency_hours || 24; 
                      setFrequency(f.toString()); 
                      setFrequencyType(f === 168 ? 'weekly' : f === 24 ? 'daily' : 'custom'); 
                      setDaysOn(group.protocol?.days_on?.toString() || "7"); 
                      setDaysOff(group.protocol?.days_off?.toString() || "0"); 
                      setSkipWeekends(group.protocol?.skip_weekends || false); 
                      setTimeBuckets(group.protocol?.time_buckets || []); 
                      setDoseUnit(group.protocol?.dose_unit || getDoseUnitLabel(group.vial, 0));
                    }} className="flex-1 sm:flex-none btn btn-outline bg-success/5 hover:bg-success/10 border-success/20 p-2 sm:px-3" title="Set Protocol">
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
                      {group.protocol.dose_amount}{group.protocol.dose_unit || getDoseUnitLabel(group.vial, 0)} every {group.protocol.frequency_hours}h
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROTOCOL SCHEDULING SHEET ── */}
      {schedulingVial && (
        <div className="sheet-overlay">
          <div className="sheet-inner">
            <div className="sheet-header">
              <button className="sheet-back-btn" onClick={() => setSchedulingVial(null)}>
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="sheet-title">Schedule — {schedulingVial.name}</span>
            </div>

            <div className="sheet-section">
              <p className="sheet-section-label">Dose Amount</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="big-input"
                  style={{ flex: 1 }}
                  type="number"
                  inputMode="decimal"
                  value={doseAmount}
                  onChange={e => setDoseAmount(e.target.value)}
                  autoFocus
                />
                <select 
                  className="form-input" 
                  style={{ width: '80px', background: '#09090b', fontWeight: 600 }}
                  value={doseUnit}
                  onChange={e => setDoseUnit(e.target.value)}
                >
                  <option value="mcg">mcg</option>
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="IU">IU</option>
                  <option value="units">units</option>
                  <option value="pills">pills</option>
                </select>
              </div>
            </div>

            <div className="sheet-section">
              <p className="sheet-section-label">Frequency</p>
              <div className="seg-control" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {(['daily', 'weekly', 'custom'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`seg-btn ${frequencyType === f ? 'active' : ''}`}
                    onClick={() => {
                      setFrequencyType(f);
                      if (f === 'daily') setFrequency('24');
                      else if (f === 'weekly') setFrequency('168');
                    }}
                  >
                    {f === 'daily' ? '⚡ Daily' : f === 'weekly' ? '📆 Weekly' : '⚙️ Custom'}
                  </button>
                ))}
              </div>
              {frequencyType === 'custom' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa', marginBottom: '0.375rem' }}>Hours Between Doses</p>
                  <input className="big-input" type="number" inputMode="numeric" value={frequency} onChange={e => setFrequency(e.target.value)} />
                </div>
              )}
            </div>

            <div className="sheet-section">
              <p className="sheet-section-label">Pin Times</p>
              <div className="pill-row">
                {(['morning', 'afternoon', 'night'] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    className={`pill-toggle ${timeBuckets.includes(b) ? 'active' : ''}`}
                    onClick={() => toggleBucket(b)}
                  >
                    {b === 'morning' ? '🌅 AM' : b === 'afternoon' ? '☀️ PM' : '🌙 Night'}
                  </button>
                ))}
              </div>
            </div>

            <div className="sheet-section">
              <p className="sheet-section-label">Schedule Rules</p>
              <button
                type="button"
                className={`check-row ${skipWeekends ? 'active' : ''}`}
                onClick={() => setSkipWeekends(!skipWeekends)}
              >
                <div className="check-row-icon">
                  {skipWeekends && <Check className="h-3 w-3" style={{ color: 'white' }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Skip Weekends</p>
                  <p style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Pin Mon – Fri only</p>
                </div>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[{ label: 'Start Time', type: 'time', val: preferredStartTime, set: setPreferredStartTime },
                { label: 'Days ON', type: 'number', val: daysOn, set: setDaysOn },
                { label: 'Days OFF', type: 'number', val: daysOff, set: setDaysOff }].map(({ label, type, val, set }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa', marginBottom: '0.375rem' }}>{label}</p>
                  <input
                    className="form-input"
                    style={{ background: '#18181b', textAlign: 'center', fontWeight: 700, fontSize: '1rem', border: '2px solid #27272a', borderRadius: '0.75rem' }}
                    type={type}
                    value={val}
                    onChange={e => set(e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button className="sheet-cta success" onClick={() => handleSaveProtocol(schedulingVial.id)}>
              Save Cycle Settings
            </button>
          </div>
        </div>
      )}

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

