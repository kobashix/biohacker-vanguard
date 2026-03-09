"use client";

import { useState, useEffect, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const initialMode = searchParams.get('view') === 'sign_up' ? 'signup' : 'login';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(isDemoMode);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
  );

  // Handle instant demo mode authentication
  useEffect(() => {
    if (isDemoMode) {
      console.log("[auth] Initializing Live Demo sequence...");
      const startDemo = async () => {
        setLoading(true);
        try {
          const { error: authError } = await supabase.auth.signInAnonymously();
          if (authError) {
            console.error("[auth] Demo sign-in error:", authError);
            throw authError;
          }

          console.log("[auth] Demo sign-in successful. Setting demo flag and redirecting...");
          window.localStorage.setItem('biohacker_demo_mode', 'true');
          router.replace("/dashboard");
          router.refresh();
        } catch (err: any) {
          console.error("[auth] Critical failure during demo boot:", err);
          setError(`Live Demo Initialization Failed: ${err.message || "Unknown Error"}. Please ensure Anonymous Auth is enabled in Supabase.`);
          setLoading(false);
        }
      };
      startDemo();
    }
  }, [isDemoMode, router, supabase.auth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        alert("Check your email for the confirmation link!");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>
            {isDemoMode ? "Booting Live Demo" : mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="card-description">
            BioTracker (by MMM) Zero-Knowledge Portal
          </p>
        </div>

        <div className="card-content">
          {isDemoMode ? (
            <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p style={{ color: 'var(--muted-foreground)' }}>Provisioning sterile secure environment...</p>
            </div>
          ) : (
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert-box" style={{ marginTop: '0' }}>
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', height: '2.75rem' }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  mode === "login" ? "Sign In" : "Register"
                )}
              </button>
            </form>
          )}

          {!isDemoMode && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="btn-outline"
                style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
              >
                {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#09090b' }} />}>
      <LoginContent />
    </Suspense>
  );
}
