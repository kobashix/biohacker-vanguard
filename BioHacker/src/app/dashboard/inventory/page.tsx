"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { VialManager } from "@/components/VialManager";

export default function InventoryPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
        <h1 className="text-3xl font-bold">Vial Inventory</h1>
        <p className="text-muted-foreground">Manage your powder stockpile and active mixed solutions.</p>
      </header>

      <div className="max-w-4xl">
        <VialManager userId={user.id} />
      </div>
    </div>
  );
}
