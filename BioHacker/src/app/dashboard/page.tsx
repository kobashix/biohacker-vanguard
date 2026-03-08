"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { VialManager } from "@/components/VialManager";
import { DosageCalendar } from "@/components/DosageCalendar";
import { SubjectiveLogger } from "@/components/SubjectiveLogger";
import { HelpGuides } from "@/components/HelpGuides";
import { CycleManager } from "@/components/CycleManager";
import { SupplyTracker } from "@/components/SupplyTracker";

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
  { id: 'snap-home',      emoji: '📊', label: 'Active Stacks',    nextLabel: 'Pin Schedule' },
  { id: 'snap-calendar',  emoji: '📅', label: 'Pin Schedule',      nextLabel: 'Pump & Recovery' },
  { id: 'snap-wellbeing', emoji: '💓', label: 'Pump & Recovery',   nextLabel: null },
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

      {/* ── Scrollable content — vertically centered if short ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '0.5rem',
      }}>
        {children}
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
function MobileSnapDash({ userId, onSelectVial }: { userId: string; onSelectVial: (id: string) => void }) {
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
          height: 'calc(100dvh - 64px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <SnapSection emoji="📊" label="Active Stacks" index={0} total={TOTAL} nextLabel="Pin Schedule">
          <InventoryAlerts userId={userId} />
        </SnapSection>

        <SnapSection emoji="📅" label="Pin Schedule" index={1} total={TOTAL} nextLabel="Pump & Recovery">
          <DosageCalendar userId={userId} onSelectVial={onSelectVial} />
        </SnapSection>

        <SnapSection emoji="💓" label="Pump & Recovery" index={2} total={TOTAL} nextLabel={null}>
          <SubjectiveLogger userId={userId} />
        </SnapSection>
      </div>
    </>
  );
}

/* ─── Dashboard Content ──────────────────────────────────────────────── */
function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [activeLoggingVialId, setActiveLoggingVialId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dash';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  if (!user) return null;

  return (
    <div>
      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:block">
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Cycle Command Center</h1>
            <p className="text-[#a1a1aa] text-lg max-w-2xl font-medium">Real-time status of your active stacks and blood saturation levels.</p>
          </div>
          <div className="grid grid-cols-12 gap-10">
            {/* Main column */}
            <div className="col-span-8 flex flex-col gap-10">
              <CycleManager userId={user.id} />
              <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
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
              <VialManager userId={user.id} externalLoggingVialId={activeLoggingVialId} onLoggingComplete={() => setActiveLoggingVialId(null)} />
              <ReconstitutionEngine />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden">
        {tab === 'dash' && (
          <MobileSnapDash userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
        )}

        {tab === 'vials' && (
          <div className="flex flex-col gap-4">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Stash</h1>
            <SupplyTracker userId={user.id} />
            <VialManager
              userId={user.id}
              externalLoggingVialId={activeLoggingVialId}
              onLoggingComplete={() => setActiveLoggingVialId(null)}
            />
          </div>
        )}

        {tab === 'plan' && (
          <div className="flex flex-col gap-4">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Cycle Plan</h1>
            <CycleManager userId={user.id} />
            <PKChart userId={user.id} />
            <ReconstitutionEngine />
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
