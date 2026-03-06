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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background pb-20 lg:pb-0">
      <div className="hidden lg:block">
        <Sidebar onSignOut={handleSignOut} />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
          
          <footer className="mt-20 py-10 border-t border-border text-[10px] text-muted-foreground space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              HIPAA & SOC-2 Compliance Statement
            </div>
            <p className="leading-relaxed">
              BioHacker (by MMM) is engineered with zero-knowledge, local-first architecture. 
              All pharmaceutical data is encrypted at-rest and protected by PostgreSQL Row-Level Security (RLS). 
              Our systems are aligned with GAAP standards for clinical inventory management and SOC-2 data isolation protocols. 
              We do not sell medical data. All telemetry is stored strictly for the purpose of user-directed reporting and analysis.
            </p>
            <p>© 2026 MinMaxMuscle Pro. All Rights Reserved.</p>
          </footer>
        </div>
      </main>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
