"use client";

import { useEffect, useState, ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
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
    router.push("/");
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
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0 border-r border-[#27272a]">
        <Sidebar onSignOut={handleSignOut} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:p-10 pb-28 lg:pb-10">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
            
            <footer className="mt-24 py-12 border-t border-[#27272a] text-[10px] text-[#a1a1aa] space-y-4">
              <div className="flex items-center gap-2 text-[#2563eb] font-bold uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                HIPAA & SOC-2 Compliance Statement
              </div>
              <p className="leading-relaxed max-w-3xl">
                BioHacker (by MMM) is engineered with zero-knowledge, local-first architecture. 
                All pharmaceutical data is encrypted at-rest and protected by PostgreSQL Row-Level Security (RLS). 
                Our systems are aligned with GAAP standards for clinical inventory management and SOC-2 data isolation protocols. 
                We do not sell medical data. All telemetry is stored strictly for the purpose of user-directed reporting and analysis.
              </p>
              <p>© 2026 MinMaxMuscle Pro. All Rights Reserved.</p>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
