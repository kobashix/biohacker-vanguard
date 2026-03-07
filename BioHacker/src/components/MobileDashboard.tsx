"use client";

import { useState } from "react";
import { Syringe, Beaker, Calendar, Activity, Package, ChevronRight, Plus, Droplets, CircleDot, Archive, Clock, BarChart3, Smile, BookOpen } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Protocol, Supply } from "@/replicache";

interface MobileDashboardProps {
  userId: string;
  onNavigate: (view: MobileView) => void;
}

export type MobileView = 'home' | 'vials' | 'log' | 'supplies' | 'schedule';

// ─── Quick-stat pill ─────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl flex-1" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <span className="text-xl font-black" style={{ color }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────
function MobileHome({ userId, onNavigate }: MobileDashboardProps) {
  const rep = getReplicache(userId);
  const vials = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "vial/" }).values().toArray()) as Vial[], { default: [] });
  const protocols = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "protocol/" }).values().toArray()) as Protocol[], { default: [] });
  const supplies = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "supply/" }).values().toArray()) as Supply[], { default: [] });

  const activeVials = vials.filter(v => v.status === 'mixed' || v.status === 'pill' || protocols.find(p => p.vial_id === v.id));
  const lowSupplies = supplies.filter(s => s.count < 10);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-28">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-sm font-medium">{greeting}</p>
        <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">Clinical Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3">
        <StatPill label="Active" value={activeVials.length} color="#2563eb" />
        <StatPill label="Protocols" value={protocols.length} color="#10b981" />
        <StatPill label="Low Stock" value={lowSupplies.length} color={lowSupplies.length > 0 ? "#ef4444" : "#10b981"} />
      </div>

      {/* Primary Action — Log Dose */}
      <button
        onClick={() => onNavigate('log')}
        className="w-full p-5 rounded-2xl flex items-center justify-between text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/15 rounded-xl">
            <Syringe className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="font-black text-lg leading-tight">Log a Dose</div>
            <div className="text-blue-200 text-sm font-normal">Record administration</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-blue-300" />
      </button>

      {/* Active Protocols List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Protocols</h2>
          <button onClick={() => onNavigate('vials')} className="text-primary text-xs font-bold">Manage →</button>
        </div>
        <div className="flex flex-col gap-2">
          {activeVials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active vials yet.{" "}
              <button onClick={() => onNavigate('vials')} className="text-primary font-bold">Add one →</button>
            </div>
          )}
          {activeVials.slice(0, 4).map(vial => {
            const protocol = protocols.find(p => p.vial_id === vial.id);
            return (
              <button
                key={vial.id}
                onClick={() => onNavigate('log')}
                className="w-full p-4 rounded-2xl border border-border bg-card flex items-center gap-4 active:bg-muted/20 transition-colors text-left"
              >
                <div className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ background: vial.status === 'mixed' ? 'rgba(37,99,235,0.12)' : vial.status === 'pill' ? 'rgba(16,185,129,0.12)' : 'rgba(161,161,170,0.12)' }}>
                  {vial.status === 'mixed' ? <Droplets className="h-5 w-5 text-primary" /> :
                   vial.status === 'pill' ? <CircleDot className="h-5 w-5 text-success" /> :
                   <Beaker className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base truncate">{vial.name}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {protocol ? `${protocol.dose_amount} · every ${protocol.frequency_hours}h` : 'No protocol set'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Vial Manager", sub: `${vials.length} items`, icon: Beaker, color: "#2563eb", view: 'vials' as MobileView },
            { label: "Supplies", sub: `${supplies.length} tracked`, icon: Package, color: "#10b981", view: 'supplies' as MobileView },
            { label: "Schedule", sub: `${protocols.length} protocols`, icon: Calendar, color: "#f59e0b", view: 'schedule' as MobileView },
            { label: "Analytics", sub: "Dose history", icon: BarChart3, color: "#8b5cf6", view: 'home' as MobileView },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-3 active:bg-muted/20 transition-colors text-left"
            >
              <div className="p-2.5 rounded-xl w-fit" style={{ background: `${item.color}15` }}>
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Low stock alert */}
      {lowSupplies.length > 0 && (
        <button onClick={() => onNavigate('supplies')} className="w-full p-4 rounded-2xl flex items-center gap-3 border border-destructive/30 bg-destructive/5 active:bg-destructive/10 text-left">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Package className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <div className="font-bold text-sm text-destructive">Low Stock Alert</div>
            <div className="text-xs text-muted-foreground">{lowSupplies.map(s => s.name).join(', ')} running low</div>
          </div>
          <ChevronRight className="h-4 w-4 text-destructive ml-auto flex-shrink-0" />
        </button>
      )}
    </div>
  );
}

// ─── Mobile Vial List view ────────────────────────────────────────────────────
function MobileVialList({ userId, onNavigate }: MobileDashboardProps) {
  const rep = getReplicache(userId);
  const vials = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "vial/" }).values().toArray()) as Vial[], { default: [] });
  const protocols = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "protocol/" }).values().toArray()) as Protocol[], { default: [] });

  const handleDelete = async (vialId: string) => {
    if (!rep || !confirm("Delete this vial?")) return;
    await rep.mutate.deleteVial(vialId);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-28">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Vial Manager</h1>
      </div>

      <div className="flex flex-col gap-3">
        {vials.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Beaker className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No vials yet</p>
            <p className="text-sm mt-1">Tap + to add your first</p>
          </div>
        )}
        {vials.map(vial => {
          const protocol = protocols.find(p => p.vial_id === vial.id);
          const volPct = vial.status === 'mixed' && vial.volume_ml > 0
            ? Math.max(0, Math.min(100, (vial.remaining_volume_ml / vial.volume_ml) * 100))
            : null;

          return (
            <div key={vial.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl flex-shrink-0"
                  style={{ background: vial.status === 'mixed' ? 'rgba(37,99,235,0.12)' : vial.status === 'pill' ? 'rgba(16,185,129,0.12)' : 'rgba(161,161,170,0.12)' }}>
                  {vial.status === 'mixed' ? <Droplets className="h-5 w-5 text-primary" /> :
                   vial.status === 'pill' ? <CircleDot className="h-5 w-5 text-success" /> :
                   <Beaker className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{vial.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {(vial.compounds || []).map(c => `${c.mass_mg}${c.unit} ${c.name}`).join(' + ')}
                  </div>
                  {vial.status === 'mixed' && volPct !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${volPct}%`, background: volPct > 30 ? '#2563eb' : '#ef4444' }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">{vial.remaining_volume_ml.toFixed(2)}mL remaining</div>
                    </div>
                  )}
                  {vial.status === 'pill' && (
                    <div className="text-xs text-success mt-1 font-medium">{vial.pill_count} pills remaining</div>
                  )}
                </div>
              </div>
              {protocol && (
                <div className="px-4 pb-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-primary bg-primary/8 px-2 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    {protocol.dose_amount} · every {protocol.frequency_hours}h
                  </div>
                </div>
              )}
              <div className="flex border-t border-border divide-x divide-border">
                <button onClick={() => onNavigate('log')} className="flex-1 py-3 text-xs font-bold text-primary flex items-center justify-center gap-1.5 active:bg-primary/5">
                  <Syringe className="h-3.5 w-3.5" /> Log Dose
                </button>
                <button onClick={() => handleDelete(vial.id)} className="flex-1 py-3 text-xs font-bold text-destructive flex items-center justify-center gap-1.5 active:bg-destructive/5">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile Log Dose view ─────────────────────────────────────────────────────
function MobileLogDose({ userId }: { userId: string }) {
  const rep = getReplicache(userId);
  const vials = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "vial/" }).values().toArray()) as Vial[], { default: [] });
  const protocols = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "protocol/" }).values().toArray()) as Protocol[], { default: [] });

  const [selectedVial, setSelectedVial] = useState<Vial | null>(null);
  const [doseAmount, setDoseAmount] = useState("250");
  const [site, setSite] = useState("Abdomen (Left)");
  const [logged, setLogged] = useState(false);

  const activeVials = vials.filter(v => v.status === 'mixed' || v.status === 'pill');
  const SITES = ["Abdomen (Left)", "Abdomen (Right)", "Glute (Left)", "Glute (Right)", "Thigh (Left)", "Thigh (Right)", "Deltoid (Left)", "Deltoid (Right)"];

  const handleLog = async () => {
    if (!rep || !selectedVial) return;
    const compound = selectedVial.compounds[0];
    let units_iu = 0;
    if (selectedVial.status === 'mixed') {
      const { calculateRequiredUnits } = await import('@/math');
      units_iu = calculateRequiredUnits(compound.mass_mg, selectedVial.volume_ml, parseFloat(doseAmount), compound.unit).toNumber();
    }
    await rep.mutate.logDose({
      id: crypto.randomUUID(),
      vial_id: selectedVial.id,
      substance: `${selectedVial.name} (${compound.name})`,
      dose_amount: parseFloat(doseAmount),
      unit: selectedVial.status === 'pill' ? 'pills' : compound.unit === 'mg' ? 'mcg' : 'IU',
      units_iu,
      timestamp: Date.now(),
      injection_site: selectedVial.status === 'mixed' ? site : undefined,
    });
    setLogged(true);
    setTimeout(() => { setLogged(false); setSelectedVial(null); }, 2000);
  };

  if (logged) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-8">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
          <Activity className="h-9 w-9 text-success" />
        </div>
        <h2 className="text-2xl font-black text-center">Dose Logged!</h2>
        <p className="text-muted-foreground text-center text-sm">Administration recorded successfully.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-28">
      <h1 className="text-2xl font-black">Log Administration</h1>

      {/* Vial Picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Select Compound</label>
        <div className="flex flex-col gap-2">
          {activeVials.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">No active vials. Add one in Vial Manager.</p>
          )}
          {activeVials.map(vial => {
            const protocol = protocols.find(p => p.vial_id === vial.id);
            const isSelected = selectedVial?.id === vial.id;
            return (
              <button
                key={vial.id}
                onClick={() => { setSelectedVial(vial); if (protocol) setDoseAmount(protocol.dose_amount.toString()); }}
                className="w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4"
                style={{ borderColor: isSelected ? '#2563eb' : 'var(--border)', background: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--card)' }}
              >
                <div className="p-2.5 rounded-xl" style={{ background: vial.status === 'mixed' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)' }}>
                  {vial.status === 'mixed' ? <Droplets className="h-5 w-5 text-primary" /> : <CircleDot className="h-5 w-5 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{vial.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {protocol ? `Protocol: ${protocol.dose_amount} ${vial.status === 'pill' ? 'pills' : 'mcg'}` : 'No protocol'}
                  </div>
                </div>
                {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedVial && (
        <>
          {/* Dose Amount */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
              Dose Amount ({selectedVial.status === 'pill' ? 'pills' : selectedVial.compounds[0]?.unit === 'mg' ? 'mcg' : 'IU'})
            </label>
            <input
              type="number"
              value={doseAmount}
              onChange={e => setDoseAmount(e.target.value)}
              className="w-full p-4 text-2xl font-black text-center bg-card border-2 border-primary rounded-2xl text-white focus:outline-none"
            />
          </div>

          {/* Injection site */}
          {selectedVial.status === 'mixed' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Injection Site</label>
              <div className="grid grid-cols-2 gap-2">
                {SITES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSite(s)}
                    className="py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{ borderColor: site === s ? '#2563eb' : 'var(--border)', background: site === s ? 'rgba(37,99,235,0.08)' : 'transparent', color: site === s ? '#2563eb' : 'var(--muted-foreground)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLog}
            className="w-full py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <Syringe className="h-5 w-5" />
            Record Administration
          </button>
        </>
      )}
    </div>
  );
}

// ─── Mobile Supplies view ─────────────────────────────────────────────────────
function MobileSupplies({ userId }: { userId: string }) {
  const rep = getReplicache(userId);
  const supplies = useSubscribe(rep, async (tx) => (await tx.scan({ prefix: "supply/" }).values().toArray()) as Supply[], { default: [] });

  const adjust = async (supply: Supply, delta: number) => {
    if (!rep) return;
    await rep.mutate.updateSupply({ ...supply, count: Math.max(0, supply.count + delta) });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-28">
      <h1 className="text-2xl font-black">Supplies</h1>
      <div className="flex flex-col gap-3">
        {supplies.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No supplies tracked</p>
          </div>
        )}
        {supplies.map(sup => (
          <div key={sup.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-bold">{sup.name}</div>
              <div className={`text-sm font-medium mt-0.5 ${sup.count < 10 ? 'text-destructive' : 'text-success'}`}>
                {sup.count} {sup.unit}
                {sup.count < 10 && ' — Low Stock'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => adjust(sup, -1)} className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center text-lg font-black active:bg-muted/40">−</button>
              <span className="text-xl font-black w-8 text-center">{sup.count}</span>
              <button onClick={() => adjust(sup, 1)} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary active:bg-primary/20">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Mobile Dashboard ────────────────────────────────────────────────────
export function MobileDashboard({ userId }: { userId: string }) {
  const [view, setView] = useState<MobileView>('home');

  const tabs: { id: MobileView; label: string; icon: typeof Syringe }[] = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'log', label: 'Log', icon: Syringe },
    { id: 'vials', label: 'Vials', icon: Beaker },
    { id: 'supplies', label: 'Supplies', icon: Package },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <div className="relative">
      {/* View content */}
      {view === 'home' && <MobileHome userId={userId} onNavigate={setView} />}
      {view === 'log' && <MobileLogDose userId={userId} />}
      {view === 'vials' && <MobileVialList userId={userId} onNavigate={setView} />}
      {view === 'supplies' && <MobileSupplies userId={userId} />}
      {view === 'schedule' && (
        <div className="px-4 pt-6 pb-28">
          <h1 className="text-2xl font-black mb-4">Schedule</h1>
          <p className="text-muted-foreground text-sm">Open the desktop view for full schedule management.</p>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border flex justify-around items-end pb-safe-bottom shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.5)]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all active:scale-90"
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary' : 'bg-transparent'}`}>
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
