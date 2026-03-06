"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { DosageCalendar } from "@/components/DosageCalendar";
import { VialManager } from "@/components/VialManager";
import { CycleManager } from "@/components/CycleManager";
import { Plus, X } from "lucide-react";

export default function SchedulerPage() {
  const [user, setUser] = useState<any>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [selectedVialId, setSelectedVialId] = useState<string | null>(null);

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
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Protocol Scheduler</h1>
          <p className="text-muted-foreground">Manage your weekly dosing routines and cycle boundaries.</p>
        </div>
        <button 
          onClick={() => setIsAddingProtocol(!isAddingProtocol)} 
          className="btn btn-primary flex gap-2"
        >
          {isAddingProtocol ? <><X className="h-4 w-4" /> Close</> : <><Plus className="h-4 w-4" /> New Protocol</>}
        </button>
      </header>

      {isAddingProtocol && (
        <div className="card border-primary bg-primary/5">
          <div className="card-header">
            <h3 className="card-title">Create New Dosing Routine</h3>
            <p className="card-description">Select a vial from your inventory below to set its schedule.</p>
          </div>
          <div className="card-content">
            <VialManager userId={user.id} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-9">
          <DosageCalendar userId={user.id} onSelectVial={(id) => {
            setSelectedVialId(id);
            setIsAddingProtocol(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
        <div className="xl:col-span-3">
          <CycleManager userId={user.id} />
        </div>
      </div>
    </div>
  );
}
