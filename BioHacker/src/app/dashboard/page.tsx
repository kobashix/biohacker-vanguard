"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { VialManager } from "@/components/VialManager";
import { DosageCalendar } from "@/components/DosageCalendar";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLoggingVialId, setActiveLoggingVialId] = useState<string | null>(null);
  
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          BioHacker (by MMM) <span className="header-badge">v2.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="encryption-badge">
            <ShieldCheck className="h-4 w-4" />
            Secure Session: {user.email}
          </div>
          <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <ReconstitutionEngine />
          <VialManager userId={user.id} externalLoggingVialId={activeLoggingVialId} onLoggingComplete={() => setActiveLoggingVialId(null)} />
        </aside>

        <section className="content-area">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <DosageCalendar userId={user.id} onSelectVial={(id) => setActiveLoggingVialId(id)} />
            <PKChart />
            <InventoryAlerts userId={user.id} />
          </div>
        </section>
      </main>
    </div>
  );
}
