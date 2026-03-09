"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Calculator,
  PackageOpen,
  Zap,
  TrendingUp,
  Smartphone,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Binary
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] overflow-x-hidden font-sans">
      {/* ── SEAMLESS NAVIGATION ── */}
      <header className="fixed top-0 left-0 right-0 z-50 diag-hud border-none bg-transparent">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center shadow-lg shadow-[#0071E3]/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              BioTracker <span className="text-[#0071E3]">V1.1</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#86868B] uppercase tracking-widest">
            <a href="#features" className="hover:text-[#0071E3] transition-colors">Architecture</a>
            <a href="#security" className="hover:text-[#0071E3] transition-colors">Privacy</a>
            <Link href="/login" className="hover:text-[#0071E3] transition-colors">Console</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-primary shadow-xl shadow-[#0071E3]/30">
              Access Vault
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO SECTION: THE COMMAND CENTER ── */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-softFadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0071E3]/10 rounded-full border border-[#0071E3]/20">
                <Sparkles className="h-4 w-4 text-[#0071E3]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#0071E3]">Vanguard Clinical Release</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-[#1D1D1F]">
                Absolute <br />
                <span className="text-[#0071E3]">Precision</span> Control.
              </h1>

              <p className="text-xl md:text-2xl text-[#86868B] max-w-xl font-medium leading-tight">
                The world’s most advanced local-first engine for compound integrity,
                pharmacokinetic modeling, and clinical audit trails.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/login?view=sign_up" className="btn btn-primary px-10 py-5 text-lg group">
                  Initialize Inventory <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login?demo=true" className="btn btn-outline px-10 py-5 text-lg bg-white/50 backdrop-blur-md">
                  Launch Live Demo
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8 opacity-60">
                <div className="flex flex-col">
                  <span className="text-2xl font-black italic">100%</span>
                  <span className="tech-label">Zero-Knowledge</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black italic">0.01ml</span>
                  <span className="tech-label">Precision Math</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black italic">Offline</span>
                  <span className="tech-label">First Architecture</span>
                </div>
              </div>
            </div>

            <div className="relative group animate-softFadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0071E3]/30 to-[#10b981]/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-white/50">
                <img
                  src="/C:/Users/Nope/.gemini/antigravity/brain/734bb58f-1acb-4d25-b28b-528552fcad34/biotracker_desktop_mockup_1773085725528.png"
                  alt="BioTracker Clinical Console"
                  className="w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE BENTO GRID ── */}
        <section id="features" className="py-24 px-6 bg-[#FBFBFD]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Clinical Infrastructure.</h2>
              <p className="text-[#86868B] text-lg font-medium max-w-2xl mx-auto italic">
                More than a logger. It's a pharmacy-grade audit engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:grid-rows-2 h-auto md:h-[800px]">
              {/* Feature 1: U-100 Math */}
              <div className="md:col-span-8 card !p-12 bg-white flex flex-col justify-between group overflow-hidden">
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 bg-[#0071E3]/5 rounded-2xl flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-[#0071E3]" />
                  </div>
                  <h3 className="text-3xl font-black">U-100 Algebraic Engine</h3>
                  <p className="text-xl text-[#86868B] font-medium max-w-md">
                    Instantly convert mg/mcg/IU. Our sub-milliliter math ensures your draw-volume
                    is always medically exact. Zero margin for error.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 top-12 w-1/2 hidden md:block">
                  <img
                    src="/C:/Users/Nope/.gemini/antigravity/brain/734bb58f-1acb-4d25-b28b-528552fcad34/biotracker_app_mockup_1773085706384.png"
                    alt="Mobile UI Display"
                    className="h-full w-auto object-cover object-top rounded-tl-[40px] shadow-2xl transform translate-x-20 translate-y-20 group-hover:translate-x-16 group-hover:translate-y-16 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Feature 2: Stash Integrity */}
              <div className="md:col-span-4 card !p-12 !bg-[#1D1D1F] text-white flex flex-col justify-end">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <PackageOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black">Stash Integrity Audit</h3>
                  <p className="text-white/60 font-medium">
                    Real-time inventory levels. Prevent cache loss with pharmaceutical-grade stockpile confirmation.
                  </p>
                </div>
              </div>

              {/* Feature 3: PK Modeling */}
              <div className="md:col-span-4 card !p-12 bg-[#0071E3] text-white flex flex-col justify-end">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black">PK Saturation Curve</h3>
                  <p className="text-white/80 font-medium">
                    Predictive blood-concentration modeling based on ester length and dose frequency.
                  </p>
                </div>
              </div>

              {/* Feature 4: Offline Replicache */}
              <div className="md:col-span-8 card !p-12 bg-white flex items-center gap-12 group">
                <div className="space-y-6 flex-1">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black">Local-First Vault.</h3>
                  <p className="text-[#86868B] text-lg font-medium italic">
                    "Her-level" predictive logic synchronized via Replicache.
                    Instant interaction, zero latency, total offline capability.
                  </p>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F] border border-[#1D1D1F]/10 px-3 py-1.5 rounded-full">
                      <Database className="h-3 w-3" /> IndexedDB Store
                    </span>
                    <span className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F] border border-[#1D1D1F]/10 px-3 py-1.5 rounded-full">
                      <Binary className="h-3 w-3" /> Delta Sync
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block w-1/3 text-[#1D1D1F]/5 group-hover:text-[#0071E3]/10 transition-colors">
                  <Zap className="h-full w-full" strokeWidth={0.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECURITY / PRIVACY SECTION ── */}
        <section id="security" className="py-32 px-6 bg-[#000] text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,113,227,0.15),transparent_70%)]" />
          <div className="max-w-[1400px] mx-auto text-center relative z-10">
            <Lock className="h-16 w-16 text-[#0071E3] mx-auto mb-10" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">Clinical Privacy. <br />No Exceptions.</h2>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed mb-16 italic">
              BioTracker is designed for high-performance practitioners who demand operational security.
              We don't see your data. We don't sell your data. Your clinical environment is encrypted
              end-to-end and stored on your hardware.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="p-8 glass-panel border-white/5">
                <h4 className="text-4xl font-black mb-2 italic">AES-256</h4>
                <p className="tech-label text-white/40">Encryption</p>
              </div>
              <div className="p-8 glass-panel border-white/5">
                <h4 className="text-4xl font-black mb-2 italic">Zero</h4>
                <p className="tech-label text-white/40">Knowledge</p>
              </div>
              <div className="p-8 glass-panel border-white/5">
                <h4 className="text-4xl font-black mb-2 italic">HIPAA</h4>
                <p className="tech-label text-white/40">Standards</p>
              </div>
              <div className="p-8 glass-panel border-white/5">
                <h4 className="text-4xl font-black mb-2 italic">Local</h4>
                <p className="tech-label text-white/40">Persistence</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE CTA ── */}
        <section className="py-24 px-6 bg-[#F5F5F7]">
          <div className="max-w-[800px] mx-auto card !p-12 text-center shadow-2xl border-none">
            <Smartphone className="h-12 w-12 text-[#0071E3] mx-auto mb-8" />
            <h2 className="text-4xl font-black mb-6">Built for the Field.</h2>
            <p className="text-lg text-[#86868B] font-medium mb-10 italic">
              BioTracker is a Progressive Web App. Install it directly to your Home Screen for
              instant mobile access and biometric authentication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn btn-primary px-12 py-5 text-lg">
                Enter Console
              </Link>
              <button className="btn btn-outline px-12 py-5 text-lg">
                Mobile Install Guide
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-[#1D1D1F]/5 text-center space-y-8">
        <div className="flex justify-center items-center gap-6">
          <ShieldCheck className="h-6 w-6 text-[#0071E3]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#86868B]">Bio-Interface Core Architecture</span>
        </div>
        <div className="flex justify-center gap-10 text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
          <span>HIPAA Aligned</span>
          <span>SOC-2 Ready</span>
          <span>Pharm-Grade Math</span>
        </div>
        <p className="text-[#86868B] text-xs font-medium">
          © 2026 BioTracker Core (by MMM). The ultimate bio-hacking command center.
        </p>
      </footer>
    </div>
  );
}
