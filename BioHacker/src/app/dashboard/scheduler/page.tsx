"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { DosageCalendar } from "@/components/DosageCalendar";

export default function SchedulerPage() {
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
        <h1 className="text-3xl font-bold">Protocol Scheduler</h1>
        <p className="text-muted-foreground">Plan your weekly dosing and track adherence metrics.</p>
      </header>

      <div className="w-full">
        <DosageCalendar userId={user.id} onSelectVial={(id) => {
          // In a multi-page app, we could redirect to the log form or a detail page
          console.log("Selected vial from full-page scheduler:", id);
        }} />
      </div>
    </div>
  );
}
