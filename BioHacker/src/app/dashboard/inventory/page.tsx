"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { VialManager } from "@/components/VialManager";
import { SupplyTracker } from "@/components/SupplyTracker";

export default function InventoryPage() {
  const [user, setUser] = useState<any>(null);
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
        <h1 className="text-3xl font-bold">Clinical Inventory</h1>
        <p className="text-muted-foreground">Manage your pharmaceutical compounds and medical supplies.</p>
      </header>

      <div className="space-y-8 max-w-5xl">
        <VialManager userId={user.id} />
        <SupplyTracker userId={user.id} />
      </div>
    </div>
  );
}
