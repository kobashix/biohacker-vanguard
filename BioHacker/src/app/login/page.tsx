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
      let timeoutId: any;

      const startDemo = async () => {
        setLoading(true);
        setError(null);

        // Safety timeout
        timeoutId = setTimeout(() => {
          if (loading) {
            setError("Authentication is taking longer than expected. You can try to return to login and try again.");
            setLoading(false);
          }
        }, 15000);

        try {
          const { error: authError } = await supabase.auth.signInAnonymously();
          if (authError) throw authError;

          console.log("[auth] Demo sign-in successful. Setting demo flag and redirecting...");
          window.localStorage.setItem('biohacker_demo_mode', 'true');

          // Clear timeout before redirect
          clearTimeout(timeoutId);

          router.replace("/dashboard");
          // Give it a moment before refreshing to ensure cookie is set
          setTimeout(() => router.refresh(), 100);
        } catch (err: any) {
          console.error("[auth] Critical failure during demo boot:", err);
          setError(`Live Demo Initialization Failed: ${err.message || "Unknown Error"}. Please ensure Anonymous Auth is enabled in Supabase.`);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      };

      startDemo();
      return () => clearTimeout(timeoutId);
    }
  }, [isDemoMode, router, supabase.auth, loading]);

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
              {error ? (
                <div className="text-center space-y-4">
                  <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="btn btn-primary text-xs"
                  >
                    Return to Standard Login
                  </button>
                </div>
              ) : (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p style={{ color: 'var(--muted-foreground)' }}>Provisioning sterile secure environment...</p>
                </>
              )}
            </div>
          ) : (
            <>
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

              <div style={{ position: 'relative', margin: '1.5rem 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid var(--border)' }}></div>
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <span style={{ background: 'var(--card)', padding: '0 0.5rem', color: 'var(--muted-foreground)' }}>Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });
                    if (error) throw error;
                  } catch (err: any) {
                    setError(err.message);
                    setLoading(false);
                  }
                }}
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={loading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="btn-outline"
                  style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                >
                  {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                </button>
              </div>
            </>
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
