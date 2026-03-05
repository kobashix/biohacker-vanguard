"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { VialManager } from "@/components/VialManager";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deriveEncryptionKey } from "@/crypto";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const [passphrase, setPassphrase] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem(`vanguard_key_${user?.id}`);
      if (storedKey) setIsUnlocked(true);
    };
    if (user) checkKey();
  }, [user]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    // Derive and store key locally
    const key = await deriveEncryptionKey(passphrase);
    localStorage.setItem(`vanguard_key_${user.id}`, Buffer.from(key).toString('base64'));
    setIsUnlocked(true);
  };

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isUnlocked) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="card-header" style={{ textAlign: 'center' }}>
            <ShieldCheck className="h-10 w-10 text-primary" style={{ margin: '0 auto 1rem' }} />
            <h1 className="card-title">Encryption Key Required</h1>
            <p className="card-description">Enter your passphrase to access your zero-knowledge data.</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleUnlock}>
              <div className="form-group">
                <label className="form-label">Passphrase</label>
                <input 
                  className="form-input" 
                  type="password" 
                  value={passphrase} 
                  onChange={e => setPassphrase(e.target.value)} 
                  placeholder="Your secure encryption key"
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock Data</button>
            </form>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '1rem', textAlign: 'center' }}>
              * This passphrase never leaves your device. If lost, your data cannot be recovered.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          BioHacker (by MMM) <span className="header-badge">v2.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="encryption-badge">
            <ShieldCheck className="h-4 w-4" />
            JWE Active: {user.email}
          </div>
          <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <ReconstitutionEngine />
          <VialManager userId={user.id} />
        </aside>

        <section className="content-area">
          <PKChart />
          <InventoryAlerts userId={user.id} />
        </section>
      </main>
    </div>
  );
}
