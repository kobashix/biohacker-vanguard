"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          <span className="lg:hidden">{tab === 'vials' ? 'Inventory' : tab === 'plan' ? 'Schedule & Plan' : 'Overview'}</span>
          <span className="hidden lg:inline">Cycle Command Center</span>
        </h1>
        <p className="text-[#a1a1aa] text-lg max-w-2xl font-medium hidden lg:block">Real-time status of your active stacks and compound blood saturation levels.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10 mt-2 lg:mt-8">
        {/* Main Column: Calendar & Health */}
        <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-10">
          <section id="scheduler" className={`scroll-mt-8 ${tab === 'plan' ? 'block' : 'hidden lg:block'}`}>
            <CycleManager userId={user.id} />
          </section>

          <div className={`${tab === 'dash' ? 'block' : 'hidden lg:block'}`}>
            <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className={`${tab === 'dash' ? 'block' : 'hidden lg:block'}`}><SubjectiveLogger userId={user.id} /></div>
            <div className={`${tab === 'plan' ? 'block' : 'hidden lg:block'}`}><HelpGuides /></div>
          </div>
          
          <div className={`${tab === 'plan' ? 'block' : 'hidden lg:block'}`}>
            <PKChart userId={user.id} />
          </div>
        </div>

        {/* Side Column: Inventory & Tools */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-10">
          <div className={`${tab === 'dash' ? 'block' : 'hidden lg:block'}`}>
            <InventoryAlerts userId={user.id} />
          </div>
          
          <section id="inventory" className={`flex-col gap-6 lg:gap-10 scroll-mt-8 ${tab === 'vials' ? 'flex' : 'hidden lg:flex'}`}>
            <SupplyTracker userId={user.id} />
            <VialManager userId={user.id} externalLoggingVialId={activeLoggingVialId} onLoggingComplete={() => setActiveLoggingVialId(null)} />
          </section>

          <div className={`${tab === 'plan' ? 'block' : 'hidden lg:block'}`}>
            <ReconstitutionEngine />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
