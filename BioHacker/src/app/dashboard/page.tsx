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

/* ─── Section Wrapper ────────────────────────────────────────────────── */
function SnapSection({ children, label, id }: { children: React.ReactNode; label?: string; id?: string }) {
  return (
    <section
      id={id}
      style={{
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        // Full viewport height minus nav bar (64px) and small top padding
        minHeight: 'calc(100svh - 64px)',
        maxHeight: 'calc(100svh - 64px)',
        overflow: 'hidden',
        padding: '0 0 60px 0', // 60px bottom = preview peek of next section
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {label && (
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#3f3f46',
          marginBottom: '0.75rem',
          paddingTop: '0.75rem',
        }}>
          {label}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
      {/* Peek gradient — lets user know there's more below */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(to bottom, transparent, rgba(9,9,11,0.85))',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '8px',
      }}>
        <div style={{ width: '36px', height: '3px', borderRadius: '2px', background: '#3f3f46' }} />
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
    const sectionHeight = el.clientHeight;

    const onScroll = () => {
      const scrolled = el.scrollTop;
      const idx = Math.round(scrolled / sectionHeight);
      setActiveSection(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const SECTIONS = 3;

  return (
    <>
      <DotIndicator count={SECTIONS} activeIndex={activeSection} />
      <div
        ref={containerRef}
        style={{
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          height: 'calc(100svh - 64px)',
          // Offset for fixed top content (page header is hidden on mobile snap mode)
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Section 1: Active Stacks Overview */}
        <SnapSection label="📊 Active Stacks" id="snap-home">
          <InventoryAlerts userId={userId} />
        </SnapSection>

        {/* Section 2: Schedule Calendar */}
        <SnapSection label="📅 Pin Schedule" id="snap-calendar">
          <DosageCalendar userId={userId} onSelectVial={onSelectVial} />
        </SnapSection>

        {/* Section 3: Pump & Recovery Check-in */}
        <SnapSection label="💓 Pump & Recovery" id="snap-wellbeing">
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
