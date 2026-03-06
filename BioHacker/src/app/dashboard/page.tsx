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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Clinical Overview</h1>
        <p className="text-muted-foreground">Real-time status of your protocols and physical wellbeing.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calendar & Subjective Tracking */}
        <div className="lg:col-span-8 space-y-8">
          <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
          <SubjectiveLogger userId={user.id} />
          <PKChart userId={user.id} />
        </div>

        {/* Right Column: Inventory & Math */}
        <div className="lg:col-span-4 space-y-8">
          <InventoryAlerts userId={user.id} />
          <VialManager userId={user.id} externalLoggingVialId={activeLoggingVialId} onLoggingComplete={() => setActiveLoggingVialId(null)} />
          <ReconstitutionEngine />
        </div>
      </div>
    </div>
  );
}
