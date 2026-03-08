"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Activity, 
  Calculator, 
  PackageOpen, 
  MousePointer2, 
  Zap, 
  ClipboardCheck, 
  TrendingUp,
  FlaskConical,
  Smartphone,
  Info,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-bg" style={{ 
      minHeight: '100vh', 
      background: '#09090b',
      color: '#ffffff',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative background glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', zIndex: 0 }} />

      <header style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#2563eb', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
            <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            BIOTRACKER <span style={{ color: '#2563eb' }}>V1.0</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a1a1aa' }}>Log In</Link>
          <Link href="/login?view=sign_up" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}>Register</Link>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: 'rgba(37,99,235,0.1)', 
            borderRadius: '2rem', 
            border: '1px solid rgba(37,99,235,0.2)',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <Sparkles style={{ width: '0.9rem', height: '0.9rem', color: '#60a5fa' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The World's Most Intuitive Health Engine
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'max(3.5rem, 8vw)', 
            fontWeight: 950, 
            letterSpacing: '-0.06em', 
            lineHeight: 0.9,
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            Control your protocol.<br />
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Absolute Precision.
            </span>
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            color: '#a1a1aa', 
            maxWidth: '650px', 
            margin: '0 auto 3rem',
            lineHeight: 1.5,
            animation: 'fadeInUp 1s ease-out'
          }}>
            BioTracker is an enterprise-grade, zero-knowledge platform built for high-performance health optimization. Encrypted, offline-first, and medically rigorous.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }} className="animate-fadeInUp">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/login?view=sign_up" className="btn btn-primary" style={{ 
                padding: '1.25rem 3rem', 
                fontSize: '1.1rem', 
                borderRadius: '1rem',
                boxShadow: '0 10px 40px rgba(37,99,235,0.4)',
                fontWeight: 800
              }}>
                Start Your Cycle →
              </Link>
              <Link href="/login?demo=true" className="btn btn-outline" style={{ 
                padding: '1.25rem 3rem', 
                fontSize: '1.1rem', 
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                fontWeight: 800,
                color: '#fff'
              }}>
                Launch Live Demo
              </Link>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Smartphone style={{ width: '0.8rem', height: '0.8rem' }} /> Available as a Secure PWA for Mobile
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem',
          marginBottom: '8rem'
        }}>
          <div style={featureCardStyle} className="landing-card">
            <div style={iconBoxStyle('#3b82f6')}><Calculator /></div>
            <h3 style={featureTitleStyle}>U-100 Math Engine</h3>
            <p style={featureParaStyle}>Rigorous algebraic logic converting mcg, mg, and g to precise IU draw volumes. Zero mental math required.</p>
          </div>
          <div style={featureCardStyle} className="landing-card">
            <div style={iconBoxStyle('#10b981')}><ClipboardCheck /></div>
            <h3 style={featureTitleStyle}>Stash Integrity Audit</h3>
            <p style={featureParaStyle}>Pharmacy-grade inventory management. Prevent item loss with explicit audit trails and secure stockpile double-confirmation.</p>
          </div>
          <div style={featureCardStyle} className="landing-card">
            <div style={iconBoxStyle('#8b5cf6')}><TrendingUp /></div>
            <h3 style={featureTitleStyle}>Intuitive Optimization</h3>
            <p style={featureParaStyle}>"Her-level" predictive logic. Auto-complete compounds, estimate remaining volume, and modify schedules directly from your calendar.</p>
          </div>
        </section>

        {/* Rebranding / V1.0 Detail */}
        <section style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '2rem', 
          padding: '4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none', background: 'radial-gradient(circle at center, #2563eb, transparent)' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', position: 'relative' }}>Pure Privacy. Pure Performance.</h2>
          <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 3rem', position: 'relative' }}>
            We don't sell your data. We don't even see it. Your clinical environment is encrypted locally on your hardware. BioTracker is built for professionals who value operational security alongside peak performance.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encrypted</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>0.01ml</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Precision</div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>V1.0</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Release</div>
             </div>
          </div>
        </section>
      </main>

      <footer style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#52525b',
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <span style={{ color: '#a1a1aa' }}>Precision Math</span>
          <span style={{ color: '#a1a1aa' }}>Subjective Logs</span>
          <span style={{ color: '#a1a1aa' }}>Stockpile Audit</span>
        </div>
        © 2026 BioTracker (by MMM). The ultimate bio-hacking command center.
      </footer>
    </div>
  );
}

const featureCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  padding: '2.5rem',
  borderRadius: '1.5rem',
  position: 'relative',
  overflow: 'hidden'
};

const iconBoxStyle = (color: string): React.CSSProperties => ({
  width: '50px',
  height: '50px',
  borderRadius: '1rem',
  background: `${color}15`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  color: color
});

const featureTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 800,
  marginBottom: '0.75rem',
  letterSpacing: '-0.02em'
};

const featureParaStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#a1a1aa',
  lineHeight: 1.6
};
