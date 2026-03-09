"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Package, Loader2, LayoutDashboard, Activity, Zap, Shield, Sparkles } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { generateDemoData } from "@/lib/demoData";
import { EmptyStateQA } from "@/components/EmptyStateQA";
import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { VialManager } from "@/components/VialManager";
import { DosageCalendar } from "@/components/DosageCalendar";
import { SubjectiveLogger } from "@/components/SubjectiveLogger";
import { HelpGuides } from "@/components/HelpGuides";
import { CycleManager } from "@/components/CycleManager";
import { SupplyTracker } from "@/components/SupplyTracker";
import { GlobalQuickTip } from "@/components/GlobalQuickTip";
import { PerformInventory } from "@/components/PerformInventory";

/* ─── Dot Indicator (Mobile) ─────────────────────────────────────────── */
function DotIndicator({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 items-center lg:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`
          w-1.5 rounded-full transition-all duration-300
          ${i === activeIndex ? 'h-6 bg-[var(--primary)] shadow-sm' : 'h-1.5 bg-[var(--muted)]'}
        `} />
      ))}
    </div>
  );
}

const SNAP_SECTION_DEFS = [
  { id: 'snap-calendar', emoji: '📅', label: 'Schedule', nextLabel: 'Journal' },
  { id: 'snap-wellbeing', emoji: '💓', label: 'Wellbeing', nextLabel: 'Monitoring' },
  { id: 'snap-home', emoji: '📊', label: 'Monitoring', nextLabel: null },
];

/* ─── Section Wrapper (Mobile) ──────────────────────────────────────── */
function SnapSection({
  children, emoji, label, index, total, nextLabel,
}: {
  children: React.ReactNode;
  emoji: string;
  label: string;
  index: number;
  total: number;
  nextLabel: string | null;
}) {
  return (
    <section className="snap-start snap-always h-[calc(100dvh-120px)] flex flex-col overflow-hidden px-4">
      {/* ── Fixed header ── */}
      <div className="shrink-0 flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center text-xl">
            {emoji}
          </div>
          <span className="text-xl font-bold tracking-tight">{label}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-2">
        <div className="my-auto w-full pb-8">
          {children}
        </div>
      </div>

      {/* ── Fixed footer ── */}
      <div className="shrink-0 flex items-center justify-center gap-4 py-6">
        {nextLabel ? (
          <div className="flex flex-col items-center gap-1 opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Scroll for {nextLabel}</span>
            <div className="w-1 h-3 rounded-full bg-[var(--muted-foreground)] animate-bounce" />
          </div>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] opacity-20">End of Dashboard</span>
        )}
      </div>
    </section>
  );
}

/* ─── Mobile Snap Dash ──────────────────────────────────────────────── */
function MobileSnapDash({ userId, onSelectVial, onEditVial }: { userId: string; onSelectVial: (id: string) => void; onEditVial: (id: string) => void }) {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const sectionHeight = el.clientHeight;
      setActiveSection(Math.round(el.scrollTop / sectionHeight));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <DotIndicator count={SNAP_SECTION_DEFS.length} activeIndex={activeSection} />
      <div ref={containerRef} className="overflow-y-scroll snap-y snap-mandatory h-[calc(100dvh-120px)] scrollbar-hide">
        <SnapSection emoji="📅" label="Protocol Schedule" index={0} total={3} nextLabel="Journal">
          <DosageCalendar userId={userId} onSelectVial={onSelectVial} onEditVial={onEditVial} />
        </SnapSection>
        <SnapSection emoji="💓" label="Mood & Journal" index={1} total={3} nextLabel="Monitoring">
          <SubjectiveLogger userId={userId} />
        </SnapSection>
        <SnapSection emoji="📊" label="Active Monitoring" index={2} total={3} nextLabel={null}>
          <InventoryAlerts userId={userId} />
        </SnapSection>
      </div>
    </>
  );
}

/* ─── Dashboard Content ──────────────────────────────────────────────── */
function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [activeLoggingVialId, setActiveLoggingVialId] = useState<string | null>(null);
  const [activeEditingVialId, setActiveEditingVialId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'dash';
  const action = searchParams.get('action') || '';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
  );

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const rep = getReplicache(user?.id);
  const coreVials = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "vial/" }).values().toArray() as Vial[];
  }, { default: [], dependencies: [user?.id] });

  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.localStorage.getItem('biohacker_demo_mode') === 'true') {
      const seedAndClean = async () => {
        if (!rep) return;
        const data = generateDemoData();
        await rep.mutate.seedDemoData({
          vials: data.demoVials,
          protocols: data.demoProtocols,
          logs: data.demoLogs,
          subjectiveLogs: data.subjectiveLogs,
          supplies: data.demoSupplies,
          cycles: data.demoCycles
        });
        window.localStorage.removeItem('biohacker_demo_mode');
      };
      seedAndClean();
    }
  }, [user, rep]);

  if (!user) return null;
  const isEmpty = coreVials.length === 0;

  return (
    <div className="flex flex-col gap-12 max-w-[1600px] mx-auto">
      <GlobalQuickTip />

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex flex-col gap-10">
        {/* COMMAND HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight text-[var(--foreground)]">Welcome back, {user.email?.split('@')[0]}</h1>
            <p className="text-[var(--muted-foreground)] font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--primary)]" /> System Status: <span className="text-[var(--success)] font-bold">Optimized</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveLoggingVialId('add')}
              className="btn btn-primary gap-2"
            >
              <Plus className="h-5 w-5" /> Initialize Protocol
            </button>
          </div>
        </div>

        {isEmpty ? (
          <div className="card p-16 text-center max-w-2xl mx-auto shadow-xl">
            <EmptyStateQA userId={user.id} />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Main Activity (8 cols) */}
            <div className="col-span-8 space-y-8">
              {/* TOP ROW: BENTO - Schedule & Alerts */}
              <div className="grid grid-cols-2 gap-8">
                <div className="card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight">Protocol Schedule</h3>
                    <div className="p-2 bg-[var(--primary-muted)] rounded-lg">
                      <LayoutDashboard className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="!mt-2 min-h-[300px]">
                    <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} onEditVial={(id) => setActiveEditingVialId(id)} />
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="card !bg-[var(--primary)] text-white p-8 group overflow-hidden relative border-none">
                    <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform" />
                    <h3 className="text-2xl font-black mb-2">Cycle Optimizer</h3>
                    <p className="text-white/80 text-sm font-medium mb-6">AI-driven analysis ready for your latest bloodwork results.</p>
                    <button className="bg-white text-[var(--primary)] px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform">Run Analysis</button>
                  </div>

                  <div className="card !bg-[var(--muted)] border-none">
                    <InventoryAlerts userId={user.id} />
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Analytics */}
              <div className="card">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Saturation Analytics</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">Real-time pharmacokinetic projections</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-[var(--primary-muted)] text-[var(--primary)] text-[10px] font-bold rounded-full uppercase tracking-wider">Active Stream</span>
                  </div>
                </div>
                <div className="h-[400px]">
                  <PKChart userId={user.id} />
                </div>
              </div>

              {/* BOTTOM ROW: Wellbeing */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Wellbeing Journal</h3>
                  <Activity className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <SubjectiveLogger userId={user.id} />
              </div>
            </div>

            {/* RIGHT COLUMN: Management (4 cols) */}
            <div className="col-span-4 space-y-8">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Protocol Engines</h3>
                  <Zap className="h-5 w-5 text-[var(--secondary)]" />
                </div>
                <VialManager
                  userId={user.id}
                  externalLoggingVialId={activeLoggingVialId}
                  externalEditingVialId={activeEditingVialId}
                  onLoggingComplete={() => { setActiveLoggingVialId(null); setActiveEditingVialId(null); }}
                />
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Active Cycle</h3>
                  <Shield className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <CycleManager userId={user.id} />
              </div>

              <div className="card" id="inventory">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Apothecary</h3>
                  <Package className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <SupplyTracker userId={user.id} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card !p-6 hover:bg-[var(--muted)] transition-colors cursor-pointer">
                  <ReconstitutionEngine />
                </div>
                <div className="card !p-6 hover:bg-[var(--muted)] transition-colors cursor-pointer">
                  <HelpGuides />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden flex flex-col gap-6">
        {tab === 'dash' && (
          isEmpty ? (
            <div className="card p-8">
              <EmptyStateQA userId={user.id} />
            </div>
          ) : (
            <MobileSnapDash
              userId={user.id}
              onSelectVial={(id) => {
                setActiveLoggingVialId(id);
                router.push('?tab=inventory');
              }}
              onEditVial={(id) => {
                setActiveEditingVialId(id);
                router.push('?tab=inventory');
              }}
            />
          )
        )}

        {tab === 'inventory' && (
          <div className="flex flex-col gap-8 pb-24">
            <h1 className="text-3xl font-black tracking-tight px-4">Management</h1>
            {action === 'perform' ? (
              <div className="px-4"><PerformInventory userId={user.id} /></div>
            ) : (
              <div className="px-4 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveLoggingVialId('add')}
                    className="flex flex-col items-center justify-center gap-3 p-8 card !bg-[var(--primary)] text-white border-none shadow-lg"
                  >
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Plus className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-sm">Add Protocol</span>
                  </button>
                  <button
                    onClick={() => router.push('?tab=inventory&action=supply')}
                    className="flex flex-col items-center justify-center gap-3 p-8 card !bg-[var(--card)]"
                  >
                    <div className="p-3 bg-[var(--muted)] rounded-2xl">
                      <Package className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                    <span className="font-bold text-sm">Add Supplies</span>
                  </button>
                </div>

                <div className="card">
                  <SupplyTracker userId={user.id} initialAction={action === 'supply' ? 'add' : ''} />
                </div>

                <div className="card">
                  <VialManager
                    userId={user.id}
                    externalLoggingVialId={activeLoggingVialId === 'add' ? null : activeLoggingVialId}
                    externalEditingVialId={activeEditingVialId}
                    onLoggingComplete={() => { setActiveLoggingVialId(null); setActiveEditingVialId(null); }}
                    initialAction={activeLoggingVialId === 'add' ? 'add' : ''}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'plan' && (
          <div className="flex flex-col gap-8 pb-24 px-4">
            <h1 className="text-3xl font-black tracking-tight">Cycle Strategy</h1>
            <div className="card"><CycleManager userId={user.id} /></div>
            <div className="card !p-0 overflow-hidden"><PKChart userId={user.id} /></div>
            <div className="card"><ReconstitutionEngine /></div>
          </div>
        )}

        {tab === 'kb' && (
          <div className="pb-24 px-4">
            <h1 className="text-3xl font-black tracking-tight mb-8">Guides</h1>
            <HelpGuides />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-[var(--primary)]"><Loader2 className="animate-spin h-10 w-10" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
