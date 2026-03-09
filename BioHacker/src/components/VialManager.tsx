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
    ['BPC', 'TB-500', 'KPV', 'VIP', 'LL-37', 'Thymosin Alpha', 'Larazotide', 'GHK', 'Epitalon', 'Semax', 'Selank', 'Humanin', 'SS-31', 'MOTS-c'].some(k => comp.startsWith(k)) ? 'Peptides: Recovery' :
      ['CJC', 'Ipamorelin', 'GHRP', 'Hexarelin', 'Sermorelin', 'Tesamorelin', 'AOD', 'HGH Frag', 'MK-677', 'HGH', 'IGF', 'PEG', 'MGF', 'Kisspeptin'].some(k => comp.includes(k)) ? 'Peptides: GH / Secretagogues' :
        ['Semaglutide', 'Tirzepatide', 'Retatrutide', 'Liraglutide', 'Cagrilintide', 'Tesofensine'].some(k => comp.includes(k)) ? 'Peptides: GLP-1 / Fat Loss' :
          ['Dihexa', 'P21', 'Cerebrolysin', 'NSI-189', 'Pinealon', 'DSIP'].some(k => comp.includes(k)) ? 'Peptides: Cognitive' :
            ['PT-141', 'Melanotan', 'Kisspeptin'].some(k => comp.includes(k)) ? 'Peptides: Sexual Health' :
              ['5-Amino', 'Angiotensin', 'Thymosin Beta-4 Frag'].some(k => comp.includes(k)) ? 'Peptides: Misc' :
                ['Ostarine', 'Ligandrol', 'RAD-140', 'Andarine', 'Cardarine', 'Stenabolic', 'YK-11', 'S23', 'LGD-3303', 'AC-262', 'ACP-105', 'TLB-150'].some(k => comp.includes(k)) ? 'SARMs' :
                  ['Testosterone Cyp', 'Testosterone Enan', 'Testosterone Prop', 'Testosterone Und', 'Testosterone Sus', 'Testosterone Susp', 'Sustanon'].some(k => comp.includes(k)) ? 'Testosterone' :
                    ['Nandrolone', 'Trenbolone', 'Masteron', 'Primobolan', 'Equipoise', 'Boldenone', 'Parabolan', 'EQ +', 'Test E + Deca', 'Supertest'].some(k => comp.includes(k)) ? 'Steroids: Injectable' :
                      ['Oxandrolone', 'Stanozolol', 'Methandrostenolone', 'Oxymetholone', 'Halotestin', 'Superdrol', 'Turinabol', 'Proviron', 'Clenbuterol', 'T3', 'T4', 'Ephedrine', 'Albuterol', 'AICAR', 'MK-677 (Oral)'].some(k => comp.includes(k)) ? 'Steroids & Orals' :
                        ['Anastrozole', 'Exemestane', 'Letrozole', 'Tamoxifen', 'Clomiphene', 'Raloxifene', 'Enclomiphene', 'hCG', 'Kisspeptin-10 (LH'].some(k => comp.includes(k)) ? 'Ancillaries / PCT / AI' :
                          ['DHEA', 'Pregnenolone', 'Progesterone', 'Estradiol', 'TRT dose', 'Pellets'].some(k => comp.includes(k)) ? 'TRT / HRT' :
                            ['Vitamin', 'Glutathione', 'NAD+', 'Zinc', 'Magnesium'].some(k => comp.includes(k)) ? 'Vitamins & IV' :
                              ['Bacteriostatic', 'Sterile Saline'].some(k => comp.includes(k)) ? 'Reconstitution' :
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
  hideLists?: boolean;
}

export function VialManager({
  userId,
  externalLoggingVialId,
  externalEditingVialId,
  onLoggingComplete,
  initialAction,
  hideLists = false
}: VialManagerProps) {
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
  const [weeklyDay, setWeeklyDay] = useState("1"); // Default to Monday

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

  // Handle deep-linked actions (Logging/Editing) from Dashboard/Schedule
  useEffect(() => {
    if (!externalLoggingVialId) return;

    if (externalLoggingVialId === 'add') {
      setIsAdding(true);
      setLoggingVial(null);
      setEditingVial(null);
      setSchedulingVial(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (rawVials.length === 0) return;

    const vial = rawVials.find(v => v.id === externalLoggingVialId);
    if (vial) {
      setLoggingVial(vial);
      setEditingVial(null);
      setIsAdding(false);
      setSchedulingVial(null);

      const protocol = protocols.find(p => p.vial_id === vial.id);
      if (protocol) {
        setDoseAmount(protocol.dose_amount.toString());
        setDoseUnit(protocol.dose_unit || getDoseUnitLabel(vial, 0));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [externalLoggingVialId, rawVials.length, protocols.length]);

  useEffect(() => {
    if (!externalEditingVialId || rawVials.length === 0) return;

    const vial = rawVials.find(v => v.id === externalEditingVialId);
    if (vial) {
      setEditingVial(vial);
      setLoggingVial(null);
      setIsAdding(false);
      setSchedulingVial(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [externalEditingVialId, rawVials.length]);

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
    let start = new Date();
    start.setHours(hours, minutes, 0, 0);

    let finalDaysOn = parseInt(daysOn);
    let finalDaysOff = parseInt(daysOff);
    let finalFrequency = parseFloat(frequency);

    if (frequencyType === 'weekly') {
      finalFrequency = 168;
      finalDaysOn = 1;
      finalDaysOff = 6;

      // Pivot start date to the selected day of the week
      const targetDay = parseInt(weeklyDay);
      const currentDay = start.getDay();
      const diff = targetDay - currentDay;
      start.setDate(start.getDate() + diff);

      // If the calculated start is in the future relative to "now" but in this week, that's fine.
      // We want the most recent or upcoming "anchor" day.
    }

    await rep.mutate.createProtocol({
      id: crypto.randomUUID(), vial_id: vialId, dose_amount: parseFloat(doseAmount),
      dose_unit: doseUnit,
      frequency_hours: finalFrequency,
      days_on: finalDaysOn,
      days_off: finalDaysOff,
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius)] shadow-2xl animate-in zoom-in-95 duration-300">
            {/* sticky header */}
            <div className="sticky top-0 z-10 bg-[var(--card)]/80 backdrop-blur-md border-b border-[var(--border)] p-6 mb-6 flex items-center gap-4">
              <button
                className="btn-pill hover:bg-[var(--muted)] transition-colors"
                onClick={() => { setIsAdding(false); setEditingVial(null); setLoggingVial(null); if (onLoggingComplete) onLoggingComplete(); }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">
                  {loggingVial ? `Log Dose` : editingVial ? `Configure Vial` : 'Initialize Protocol'}
                </h2>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {loggingVial ? loggingVial.name : editingVial ? editingVial.name : 'V3 Deploy System'}
                </p>
              </div>
            </div>

            <div className="px-8 pb-10">

              {/* ── LOG PIN FORM ── */}
              {loggingVial ? (
                <div className="space-y-8">
                  {loggingVial.compounds.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Target Compound</label>
                      <select
                        className="form-input !text-lg !font-bold"
                        value={targetCompoundIndex}
                        onChange={e => setTargetCompoundIndex(parseInt(e.target.value))}
                      >
                        {loggingVial.compounds.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Dose magnitude</label>
                      <span className="text-xs font-black text-[var(--primary)] uppercase">
                        {protocols.find(p => p.vial_id === loggingVial.id)?.dose_unit || getDoseUnitLabel(loggingVial, targetCompoundIndex)}
                      </span>
                    </div>
                    <input
                      className="big-input !py-6 !text-5xl"
                      type="number"
                      inputMode="decimal"
                      value={doseAmount}
                      onChange={e => setDoseAmount(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {loggingVial.status === 'mixed' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Injection Site</label>
                      <div className="grid grid-cols-2 gap-3">
                        {INJECTION_SITES.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setInjectionSite(s)}
                            className={`
                            py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                            ${injectionSite === s
                                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                                : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}
                          `}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-full py-6 mt-6 flex items-center justify-center gap-3 text-lg"
                    onClick={() => handleLogDose(loggingVial, parseFloat(doseAmount), targetCompoundIndex)}
                  >
                    <Syringe className="h-6 w-6" />
                    Log Dose
                  </button>
                </div>
              ) : (
                /* ── ADD / EDIT COMPOUND FORM ── */
                <form onSubmit={editingVial ? (e) => { e.preventDefault(); handleUpdateVial(e); } : handleAddVial} className="space-y-8">

                  {!editingVial && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Preset Stack</label>
                      <select
                        className="form-input font-bold"
                        value={activePreset}
                        onChange={e => {
                          const val = e.target.value;
                          setActivePreset(val);
                          const preset = STACK_PRESETS.find(p => p.id === val);
                          if (preset) setCompounds(preset.compounds.map(c => ({ ...c })));
                          else setCompounds([{ name: '', mass_mg: 0, unit: 'mg' }]);
                        }}
                      >
                        <option value="custom">Custom Configuration</option>
                        {PRESET_CATEGORIES.map(cat => (
                          <optgroup key={cat} label={cat}>
                            {STACK_PRESETS.filter(p => p.category === cat).map(p => (
                              <option key={p.id} value={p.id}>{p.label.toUpperCase()}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}

                  <datalist id="compounds-list">
                    {COMPOUND_DATABASE.map((comp) => <option key={comp} value={comp} />)}
                  </datalist>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Vial Compounds</label>
                    <div className="space-y-4">
                      {(editingVial ? editingVial.compounds : compounds).map((c, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-4 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Compound #{idx + 1}</span>
                            {(editingVial ? editingVial.compounds : compounds).length > 1 && (
                              <button
                                type="button"
                                onClick={() => { const n = (editingVial ? editingVial.compounds : compounds).filter((_, i) => i !== idx); editingVial ? setEditingVial({ ...editingVial, compounds: n }) : setCompounds(n); }}
                                className="text-[10px] font-bold text-[var(--secondary)] hover:underline"
                              >Remove</button>
                            )}
                          </div>

                          <input
                            className="form-input !py-4 font-black"
                            value={c.name}
                            onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].name = e.target.value; editingVial ? setEditingVial({ ...editingVial, compounds: n }) : setCompounds(n); }}
                            placeholder="Compound Name..."
                            list="compounds-list"
                            required
                          />

                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                              <input
                                className="form-input !py-4 text-center font-black"
                                type="number"
                                step="any"
                                inputMode="decimal"
                                value={c.mass_mg || ''}
                                onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].mass_mg = parseFloat(e.target.value); editingVial ? setEditingVial({ ...editingVial, compounds: n }) : setCompounds(n); }}
                                placeholder="0"
                                required
                              />
                            </div>
                            <div className="col-span-4">
                              <select
                                className="form-input !py-4 text-center font-black"
                                value={c.unit || 'mg'}
                                onChange={e => { const n = [...(editingVial ? editingVial.compounds : compounds)]; n[idx].unit = e.target.value as any; editingVial ? setEditingVial({ ...editingVial, compounds: n }) : setCompounds(n); }}
                              >
                                <option value="mg">MG</option><option value="g">G</option><option value="IU">IU</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => { const n = [...(editingVial ? editingVial.compounds : compounds), { name: '', mass_mg: 0, unit: 'mg' as const }]; editingVial ? setEditingVial({ ...editingVial, compounds: n }) : setCompounds(n); }}
                        className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-2xl text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-3 font-bold text-sm"
                      >
                        <PlusCircle className="h-5 w-5" /> Add New Compound
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Visual State</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['powder', 'mixed', 'pill'].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`
                          py-4 rounded-2xl font-bold text-sm border transition-all
                          ${(editingVial ? editingVial.status : status) === s
                              ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                              : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}
                        `}
                          onClick={() => editingVial ? setEditingVial({ ...editingVial, status: s as any }) : setStatus(s as any)}
                        >
                          {s === 'powder' ? 'Powder' : s === 'mixed' ? 'Liquid' : 'Pill'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(editingVial ? editingVial.status : status) !== 'powder' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{(editingVial ? editingVial.status : status) === 'pill' ? 'Pill Count' : 'Total Volume (ML)'}</label>
                        <input
                          className="big-input !py-4 !text-2xl"
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          value={editingVial ? (editingVial.status === 'pill' ? editingVial.pill_count : editingVial.volume_ml) : volume}
                          onChange={e => editingVial
                            ? (editingVial.status === 'pill'
                              ? setEditingVial({ ...editingVial, pill_count: parseInt(e.target.value) })
                              : setEditingVial({ ...editingVial, volume_ml: parseFloat(e.target.value), remaining_volume_ml: parseFloat(e.target.value) }))
                            : setVolume(e.target.value)}
                        />
                      </div>
                      {(editingVial ? editingVial.status : status) === 'mixed' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">BAC Water (ML)</label>
                          <input
                            className="big-input !py-4 !text-2xl"
                            type="number"
                            step="0.1"
                            inputMode="decimal"
                            value={editingVial ? (editingVial.bac_water_ml || 0) : bacWaterMl}
                            onChange={e => editingVial
                              ? setEditingVial({ ...editingVial, bac_water_ml: parseFloat(e.target.value) })
                              : setBacWaterMl(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {editingVial && editingVial.status === 'mixed' && (
                    <div className="space-y-6 p-6 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)]">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Remaining Level</label>
                        <span className="text-2xl font-black text-[var(--primary)]">{editingVial.remaining_percent_est ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editingVial.remaining_percent_est ?? 100}
                        onChange={e => setEditingVial({ ...editingVial, remaining_percent_est: parseInt(e.target.value) })}
                        className="w-full accent-[var(--primary)]"
                      />
                    </div>
                  )}

                  {!editingVial && status !== 'pill' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Number of Vials</label>
                      <input className="big-input !py-4 !text-2xl" type="number" inputMode="numeric" value={count} onChange={e => setCount(e.target.value)} />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-full py-6 mt-6 shadow-xl shadow-[var(--primary)]/20 text-lg">
                    {editingVial ? 'Save Changes' : 'Initialize Vials'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PROTOCOL SECTION */}
      {!hideLists && (
        <>
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-xl font-black tracking-tight">Active Protocols</h3>
              </div>
              <button
                onClick={() => { setIsAdding(true); setEditingVial(null); setLoggingVial(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="btn btn-primary !py-2 !px-4 text-[10px] gap-2"
              >
                <Plus className="h-4 w-4" /> Initialize
              </button>
            </div>

            <div className="space-y-4">
              {inventory.active.map(group => (
                <div
                  key={group.vial.id}
                  className="card !p-5 hover:scale-[1.01] transition-transform group"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex gap-5 items-start sm:items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-colors ${group.vial.status === 'mixed' ? 'bg-[var(--primary-muted)] border-[var(--primary)]/20 text-[var(--primary)]' : group.vial.status === 'pill' ? 'bg-[var(--success-muted)] border-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--muted)] border-transparent text-[var(--muted-foreground)]'}`}>
                        {group.vial.status === 'mixed' ? <Droplets className="h-7 w-7" /> : group.vial.status === 'pill' ? <CircleDot className="h-7 w-7" /> : <Beaker className="h-7 w-7" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-xl tracking-tight leading-tight">{group.vial.name}</div>
                        <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1 opacity-60">
                          {(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}
                        </div>
                        {group.vial.status === 'mixed' && (
                          <div className="flex gap-4 mt-3">
                            {group.vial.bac_water_ml ? <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{group.vial.bac_water_ml}ML BAC</span> : null}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${group.vial.remaining_percent_est && group.vial.remaining_percent_est < 20 ? 'text-[var(--secondary)] bg-[var(--secondary)]/10' : 'text-[var(--primary)] bg-[var(--primary)]/10'}`}>
                              {group.vial.remaining_percent_est ?? 100}% Level
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Grid */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => { setLoggingVial(group.vial); setDoseAmount(group.protocol?.dose_amount.toString() || "250"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex-1 sm:flex-none p-3 rounded-xl bg-[var(--primary)] text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/20"
                        title="Log Dose"
                      >
                        <Syringe className="h-5 w-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => {
                          setSchedulingVial(group.vial);
                          setDoseAmount(group.protocol?.dose_amount.toString() || "250");
                          const f = group.protocol?.frequency_hours || 24;
                          setFrequency(f.toString());
                          setFrequencyType(f === 168 ? 'weekly' : f === 24 ? 'daily' : f === 12 ? 'twice_daily' : 'custom');
                          setDaysOn(group.protocol?.days_on?.toString() || "7");
                          setTimeBuckets(group.protocol?.time_buckets || []);
                          setDoseUnit(group.protocol?.dose_unit || getDoseUnitLabel(group.vial, 0));

                          // Initialize preferred start time from existing record
                          if (group.protocol?.start_time) {
                            const d = new Date(group.protocol.start_time);
                            const h = d.getHours().toString().padStart(2, '0');
                            const m = d.getMinutes().toString().padStart(2, '0');
                            setPreferredStartTime(`${h}:${m}`);
                          } else {
                            setPreferredStartTime("08:00");
                          }
                        }}
                        className="flex-1 sm:flex-none p-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary-muted)] hover:text-[var(--primary)] transition-all"
                        title="Set Protocol"
                      >
                        <Calendar className="h-5 w-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="p-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--foreground)] hover:text-white transition-all"
                        title="Edit Vial"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Permanently delete ${group.vial.name}?`)) {
                            if (group.protocol) await rep?.mutate.deleteProtocol(group.protocol.id);
                            await rep?.mutate.deleteVial(group.vial.id);
                          }
                        }}
                        className="p-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {group.protocol && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
                      <div className="text-[10px] font-black bg-[var(--primary)] text-white px-3 py-1 rounded-full shadow-sm">
                        {group.protocol.dose_amount}{group.protocol.dose_unit || getDoseUnitLabel(group.vial, 0)} • Every {group.protocol.frequency_hours !== 24 ? `${group.protocol.frequency_hours}H` : 'Day'}
                      </div>
                      {group.protocol.skip_weekends && <div className="text-[10px] font-black bg-[var(--secondary)] text-white px-3 py-1 rounded-full shadow-sm">No Weekends</div>}
                      {group.protocol.time_buckets?.map(b => (
                        <div key={b} className="text-[10px] font-black border border-[var(--primary)] text-[var(--primary)] px-3 py-0.5 rounded-full capitalize">{b}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STRATEGIC STOCKPILE */}
          <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-[var(--muted-foreground)]" />
                <h3 className="text-xl font-bold tracking-tight text-[var(--muted-foreground)]">Cold Stockpile</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.stockpile.map(group => (
                <div key={group.vial.id} className="card !p-4 border-dashed flex justify-between items-center group bg-[var(--muted)]/20 shadow-none">
                  <div>
                    <div className="font-black text-sm uppercase tracking-tight">{group.vial.name} <span className="text-[var(--primary)] ml-2">Qty {group.count}</span></div>
                    <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase mt-0.5 opacity-60">
                      {(group.vial.compounds || []).map(c => `${c.mass_mg}${c.unit || 'mg'} ${c.name}`).join(' + ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingVial(group.vial); setLoggingVial(null); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--foreground)] hover:text-white transition-all"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Permanently delete all ${group.count} ${group.vial.name} items?`)) {
                          for (const id of group.ids) await rep?.mutate.deleteVial(id);
                        }
                      }}
                      className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── PROTOCOL SCHEDULING SHEET ── */}
      {schedulingVial && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius)] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 bg-[var(--card)]/80 backdrop-blur-md border-b border-[var(--border)] p-6 mb-6 flex items-center gap-4">
              <button
                className="btn-pill hover:bg-[var(--muted)] transition-colors"
                onClick={() => setSchedulingVial(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight">Set Protocol</h2>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{schedulingVial.name}</p>
              </div>
            </div>

            <div className="px-8 pb-10 space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Dose Amount</label>
                <div className="flex gap-3">
                  <input
                    className="big-input !flex-1 !py-6 !text-5xl"
                    type="number"
                    inputMode="decimal"
                    value={doseAmount}
                    onChange={e => setDoseAmount(e.target.value)}
                    autoFocus
                  />
                  <select
                    className="form-input !w-[120px] font-black text-lg"
                    value={doseUnit}
                    onChange={e => setDoseUnit(e.target.value)}
                  >
                    <option value="mcg">MCG</option>
                    <option value="mg">MG</option>
                    <option value="g">G</option>
                    <option value="IU">IU</option>
                    <option value="units">UNIT</option>
                    <option value="pills">PILL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Frequency</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['twice_daily', 'daily', 'weekly', 'custom'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      className={`
                        py-4 rounded-2xl font-bold text-sm border transition-all
                        ${frequencyType === f
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"
                          : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}
                      `}
                      onClick={() => {
                        setFrequencyType(f);
                        if (f === 'twice_daily') setFrequency('12');
                        else if (f === 'daily') setFrequency('24');
                        else if (f === 'weekly') setFrequency('168');
                      }}
                    >
                      {f.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
                {frequencyType === 'custom' && (
                  <div className="mt-4 flex items-center gap-4 bg-[var(--muted)]/50 p-4 rounded-2xl border border-dashed border-[var(--border)]">
                    <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Every</span>
                    <input className="bg-transparent border-none text-2xl font-black text-[var(--primary)] w-24 text-center" type="number" inputMode="numeric" value={frequency} onChange={e => setFrequency(e.target.value)} />
                    <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Hours</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Timing Prefs</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['morning', 'afternoon', 'night'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      className={`
                        py-4 rounded-2xl font-bold text-sm border transition-all
                        ${timeBuckets.includes(b)
                          ? "bg-[var(--success)] text-white border-[var(--success)] shadow-lg shadow-[var(--success)]/20"
                          : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}
                      `}
                      onClick={() => toggleBucket(b)}
                    >
                      {b.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Logic Overrides</label>
                <button
                  type="button"
                  className={`
                    w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left
                    ${skipWeekends ? 'bg-[var(--secondary)]/10 border-[var(--secondary)]' : 'bg-[var(--muted)]/50 border-transparent'}
                  `}
                  onClick={() => setSkipWeekends(!skipWeekends)}
                >
                  <div className={`
                    w-6 h-6 rounded-lg border flex items-center justify-center
                    ${skipWeekends ? 'bg-[var(--secondary)] border-[var(--secondary)]' : 'bg-white border-[var(--border)]'}
                  `}>
                    {skipWeekends && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <span className={`text-sm font-black block ${skipWeekends ? 'text-[var(--secondary)]' : ''}`}>Exclude Weekends</span>
                    <span className="text-[10px] font-bold text-[var(--muted-foreground)] opacity-60">Auto-skip Saturday and Sunday</span>
                  </div>
                </button>
              </div>

              {frequencyType === 'weekly' ? (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Specific Day of Week</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setWeeklyDay(i.toString())}
                        className={`
                          py-3 rounded-xl font-bold text-xs border transition-all
                          ${weeklyDay === i.toString()
                            ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                            : "bg-[var(--muted)] border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"}
                        `}
                      >
                        {day.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {[{ label: 'Days On', type: 'number', val: daysOn, set: setDaysOn },
                  { label: 'Days Off', type: 'number', val: daysOff, set: setDaysOff }].map(({ label, type, val, set }) => (
                    <div key={label} className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">{label}</label>
                      <input
                        className="form-input !py-3 text-center font-black text-lg"
                        type={type}
                        value={val}
                        onChange={e => set(e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Anchor / Morning Start Time</label>
                <input
                  className="form-input !py-3 text-center font-black text-lg w-full"
                  type="time"
                  value={preferredStartTime}
                  onChange={e => setPreferredStartTime(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary w-full py-6 mt-6 shadow-xl shadow-[var(--primary)]/20 text-lg"
                onClick={() => handleSaveProtocol(schedulingVial.id)}
              >
                Activate Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
