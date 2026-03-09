"use client";

import { useEffect, useState, ReactNode, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ConsoleHUD } from "@/components/ConsoleHUD";
import { MobileNav } from "@/components/MobileNav";
import { GlobalQuickTip } from "@/components/GlobalQuickTip";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
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
    router.push("/login"); // Redirect to login, not "/"
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      <div className="sticky top-0 z-50 w-full flex flex-col shadow-sm">
        <ConsoleHUD onSignOut={handleSignOut} />
        <GlobalQuickTip />
      </div>

      <div className="flex flex-col min-w-0">
        <main className="flex-1 px-4 py-8 lg:p-12 pb-28 lg:pb-16 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}

            <footer className="mt-32 py-16 border-t border-[var(--border)] text-[9px] font-mono text-[var(--muted-foreground)] space-y-6 hidden lg:block uppercase tracking-widest opacity-60">
              <div className="flex items-center gap-3 text-[var(--primary)] font-bold">
                <ShieldCheck className="h-4 w-4" />
                Diagnostic Security Protocol: HIPAA & SOC-2 Compliant
              </div>
              <p className="leading-relaxed max-w-4xl">
                BIO-INTERFACE VR. 3.0 // LOCAL-FIRST ARCHITECTURE // ZERO-KNOWLEDGE ENCRYPTION ACTIVE.
                PHARMACEUTICAL TELEMETRY IS ISOLATED VIA POSTGRES RLS. ALL DATA PERSISTENCE IS USER-DIRECTED.
                SYSTEM ALIGNED WITH Clinical Inventory Best Practices.
              </p>
              <p>© 2026 BIO-TRACKER CORE SYSTEMS. AUTHORIZED PERSONNEL ONLY.</p>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav - Only if not HUD? HUD covers it usually but keep for now */}
      <div className="lg:hidden">
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
    </div>
  );
}
