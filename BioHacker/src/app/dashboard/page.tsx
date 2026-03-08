"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Package, Loader2, Sparkles, LayoutDashboard, Sun, Moon, LogOut } from "lucide-react";
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

/* ─── Dot Indicator ─────────────────────────────────────────────────── */
function DotIndicator({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div style={{
      position: 'fixed',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: i === activeIndex ? '8px' : '5px',
          height: i === activeIndex ? '20px' : '5px',
          borderRadius: '4px',
          background: i === activeIndex ? '#2563eb' : '#3f3f46',
          transition: 'all 0.2s ease',
          boxShadow: i === activeIndex ? '0 0 6px rgba(37,99,235,0.6)' : 'none',
        }} />
      ))}
    </div>
  );
}

const SNAP_SECTION_DEFS = [
  { id: 'snap-calendar',  emoji: '📅', label: 'Pin Schedule',      nextLabel: 'Mood Journal' },
  { id: 'snap-wellbeing', emoji: '💓', label: 'Mood Journal',      nextLabel: 'Active Monitoring' },
  { id: 'snap-home',      emoji: '📊', label: 'Active Monitoring', nextLabel: null },
];

/* ─── Section Wrapper ────────────────────────────────────────────────── */
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
    <section
      style={{
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        height: 'calc(100dvh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Fixed header ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 0 0.625rem',
        borderBottom: '1px solid #27272a',
        marginBottom: '0.875rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fafafa', letterSpacing: '-0.01em' }}>{label}</span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#3f3f46',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '99px',
          padding: '0.2rem 0.6rem',
          letterSpacing: '0.05em',
        }}>
          {index + 1} / {total}
        </span>
      </div>

      {/* ── Scrollable content — vertically centered if short, scrollable if tall ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Inner wrapper — margin:auto centers short content without blocking scroll on tall content */}
        <div style={{ margin: 'auto 0', width: '100%', paddingBottom: '0.75rem' }}>
          {children}
        </div>
      </div>

      {/* ── Fixed footer / swipe hint ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.625rem 0 0.5rem',
        borderTop: '1px solid #1a1a1e',
      }}>
        {nextLabel ? (
          <>
            <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: '#27272a' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              swipe ↓ {nextLabel}
            </span>
            <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: '#27272a' }} />
          </>
        ) : (
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ↑ swipe up to go back
          </span>
        )}
      </div>
    </section>
  );
}

/* ─── Mobile Snap Scroll Dashboard ──────────────────────────────────── */
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

  const TOTAL = SNAP_SECTION_DEFS.length;

  return (
    <>
      <DotIndicator count={TOTAL} activeIndex={activeSection} />
      <div
        ref={containerRef}
        style={{
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          height: 'calc(100dvh - 64px - 44px)', // Account for nav and QuickTip
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <SnapSection emoji="📅" label="Pin Schedule" index={0} total={TOTAL} nextLabel="Mood Journal">
          <DosageCalendar userId={userId} onSelectVial={onSelectVial} onEditVial={onEditVial} />
        </SnapSection>

        <SnapSection emoji="💓" label="Mood Journal" index={1} total={TOTAL} nextLabel="Active Monitoring">
          <SubjectiveLogger userId={userId} />
        </SnapSection>

        <SnapSection emoji="📊" label="Active Monitoring" index={2} total={TOTAL} nextLabel={null}>
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

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Theme initialization
    const savedTheme = localStorage.getItem('biotracker-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [supabase]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('biotracker-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const rep = getReplicache(user?.id);
  const coreVials = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "vial/" }).values().toArray() as Vial[];
  }, { default: [], dependencies: [user?.id] });

  // Handle auto-seeding for Live Demo users
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
    <div>
      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:block">
        <GlobalQuickTip />
        <div className="flex flex-col gap-10 mt-6 px-6 lg:px-10">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                   <div style={{ background: 'var(--primary-muted)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                     <LayoutDashboard style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
                   </div>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>BIOHACKER V1.0</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] mb-2">Cycle Command Center</h1>
                <p className="text-[var(--muted-foreground)] text-lg max-w-2xl font-medium">Real-time status of your active stacks and blood saturation levels.</p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={toggleTheme}
                  className="btn btn-outline"
                  style={{ borderRadius: '99px', width: '44px', height: '44px', padding: 0 }}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ borderRadius: '99px', gap: '8px', padding: '0 1.25rem' }}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {isEmpty ? (
            <EmptyStateQA userId={user.id} />
          ) : (
            <div className="grid grid-cols-12 gap-10">
            {/* Main column */}
            <div className="col-span-8 flex flex-col gap-10">
              <CycleManager userId={user.id} />
              <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} onEditVial={(id) => setActiveEditingVialId(id)} />
              <div className="grid grid-cols-2 gap-10">
                <SubjectiveLogger userId={user.id} />
                <HelpGuides />
              </div>
              <PKChart userId={user.id} />
            </div>
            {/* Side column */}
            <div className="col-span-4 flex flex-col gap-10">
              <InventoryAlerts userId={user.id} />
              <SupplyTracker userId={user.id} />
              <VialManager 
                userId={user.id} 
                externalLoggingVialId={activeLoggingVialId} 
                externalEditingVialId={activeEditingVialId}
                onLoggingComplete={() => { setActiveLoggingVialId(null); setActiveEditingVialId(null); }} 
              />
              <ReconstitutionEngine />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden">
        <GlobalQuickTip />
        
        {tab === 'dash' && (
          isEmpty ? (
            <div style={{ padding: '1rem' }}>
              <EmptyStateQA userId={user.id} />
            </div>
          ) : (
            <MobileSnapDash 
              userId={user.id} 
              onSelectVial={(id) => { 
                console.log('Mobile logging vial:', id);
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Inventory</h1>
            {action === 'perform' ? (
              <PerformInventory userId={user.id} />
            ) : (
              <>
                {/* ── Add Action Buttons ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <button 
                    onClick={() => setActiveLoggingVialId('add')}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} /> Add Compound
                  </button>
                  <button
                    onClick={() => window.history.pushState(null, '', '?tab=inventory&action=supply')}
                    style={{ background: '#3f3f46', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Package style={{ width: '1rem', height: '1rem' }} /> Add Gear
                  </button>
                </div>

                {/* ── Inventory Trackers ── */}
                <SupplyTracker userId={user.id} initialAction={action === 'supply' ? 'add' : ''} />
                <VialManager
                  userId={user.id}
                  externalLoggingVialId={activeLoggingVialId === 'add' ? null : activeLoggingVialId}
                  externalEditingVialId={activeEditingVialId}
                  onLoggingComplete={() => { setActiveLoggingVialId(null); setActiveEditingVialId(null); }}
                  initialAction={activeLoggingVialId === 'add' ? 'add' : ''}
                />
              </>
            )}
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Cycle Plan</h1>
            <CycleManager userId={user.id} />
            <PKChart userId={user.id} />
            <ReconstitutionEngine />
          </div>
        )}

        {tab === 'kb' && (
          <div style={{ padding: '1rem', paddingBottom: '80px' }}>
            <HelpGuides />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'50vh',color:'#a1a1aa'}}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
