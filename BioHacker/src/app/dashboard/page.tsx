"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { VialManager } from "@/components/VialManager";
import { DosageCalendar } from "@/components/DosageCalendar";
import { SubjectiveLogger } from "@/components/SubjectiveLogger";
import { HelpGuides } from "@/components/HelpGuides";
import { CycleManager } from "@/components/CycleManager";
import { SupplyTracker } from "@/components/SupplyTracker";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeLoggingVialId, setActiveLoggingVialId] = useState<string | null>(null);
  
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
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Clinical Overview</h1>
        <p className="text-[#a1a1aa] text-lg max-w-2xl font-medium">Real-time status of your active protocols and systemic response metrics.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10 mt-4 lg:mt-8">
        {/* Main Column: Calendar & Health */}
        <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-10">
          <section id="scheduler" className="scroll-mt-8">
            <CycleManager userId={user.id} />
          </section>

          <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <SubjectiveLogger userId={user.id} />
            <HelpGuides />
          </div>
          
          <PKChart userId={user.id} />
        </div>

        {/* Side Column: Inventory & Tools */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-10">
          <InventoryAlerts userId={user.id} />
          
          <section id="inventory" className="flex flex-col gap-6 lg:gap-10 scroll-mt-8">
            <VialManager userId={user.id} externalLoggingVialId={activeLoggingVialId} onLoggingComplete={() => setActiveLoggingVialId(null)} />
            <SupplyTracker userId={user.id} />
          </section>

          <ReconstitutionEngine />
        </div>
      </div>
    </div>
  );
}
