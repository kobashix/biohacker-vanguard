import Link from "next/link";
import { ShieldCheck, Activity, Calculator, PackageOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1rem' }}>
          BIOHACKER <span style={{ color: 'var(--primary)' }}>PRO</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>
          The world's first clinical-grade, zero-knowledge bio-tracking platform. 
          Absolute precision, total privacy.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', width: '100%', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <Calculator className="h-8 w-8 text-primary" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Precision Math Engine</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Decimal.js powered reconstitution logic with calibrated needle dead-space calculations.</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <Activity className="h-8 w-8 text-primary" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Pharmacokinetic Modeling</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Multi-compartment exponential decay models for complex pharmaceutical regimens.</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <ShieldCheck className="h-8 w-8 text-primary" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Zero-Knowledge E2EE</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Your data is encrypted on your device using WebCrypto. We can't see it, even if we wanted to.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
          Log In
        </Link>
        <Link href="/login?view=sign_up" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
          Create Account
        </Link>
      </div>

      <footer style={{ marginTop: '5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
        © 2026 BioHacker (by MMM). Enterprise Grade Bio-Analytics.
      </footer>
    </div>
  );
}
