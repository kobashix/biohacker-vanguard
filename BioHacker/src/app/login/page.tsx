"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="card-description">
            BioHacker (by MMM) Zero-Knowledge Portal
          </p>
        </div>
        
        <div className="card-content">
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

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <button 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="btn-outline"
              style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
