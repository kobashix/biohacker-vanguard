"use client";

import { useState } from "react";
import { ChevronRight, Target, Flame, Heart, Zap, Sparkles, CheckCircle2, Shield, Activity, Calendar, ArrowRight, ArrowLeft, Beaker, Syringe } from "lucide-react";
import { getReplicache, Vial, Protocol } from "@/replicache";

export function EmptyStateQA({ userId }: { userId: string }) {
  const [step, setStep] = useState(1);
  const [vialData, setVialData] = useState<Partial<Vial>>({
    name: "",
    status: 'mixed',
    volume_ml: 10,
    compounds: [{ name: "", mass_mg: 200, unit: 'mg' }]
  });
  const [protocolData, setProtocolData] = useState<Partial<Protocol>>({
    dose_amount: 50,
    frequency_hours: 84, // 3.5 days
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleFinish = async () => {
    setIsProvisioning(true);
    const rep = getReplicache(userId);
    if (!rep) return;

    const vialId = crypto.randomUUID();
    const finalVial: Vial = {
      id: vialId,
      name: vialData.name || (vialData.compounds?.[0].name ? `${vialData.compounds[0].name} Multi-dose` : "Starter Vial"),
      compounds: vialData.compounds || [{ name: "Testosterone", mass_mg: 200, unit: 'mg' }],
      volume_ml: vialData.volume_ml || 10,
      remaining_volume_ml: vialData.volume_ml || 10,
      status: vialData.status || 'mixed',
    };

    const finalProtocol: Protocol = {
      id: crypto.randomUUID(),
      vial_id: vialId,
      dose_amount: protocolData.dose_amount || 50,
      frequency_hours: protocolData.frequency_hours || 84,
      start_time: Date.now(),
      dose_unit: 'mg'
    };

    await rep.mutate.createVial(finalVial);
    await rep.mutate.createProtocol(finalProtocol);
    
    setIsProvisioning(false);
    setStep(5);
  };

  return (
    <div className="card" style={{ padding: '2.5rem', maxWidth: '640px', margin: '2rem auto', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {/* ── STEP 1: WELCOME & FEATURES ── */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'var(--primary-muted)', borderRadius: '99px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
            WELCOME TO BIOTRACKER V1.0
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Precision Bio-Monitoring</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            The professional standard for tracking compound integrity, inventory levels, and pharmacological saturation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '3rem', textAlign: 'left' }}>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Shield style={{ color: 'var(--primary)', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Integrity</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Verified U-100 logic and shelf-life tracking.</p>
            </div>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Activity style={{ color: '#10b981', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>PK Analysis</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Real-time blood concentration modeling.</p>
            </div>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Calendar style={{ color: '#f59e0b', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Scheduling</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Intelligent dose clustering and reminders.</p>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '1.125rem', borderRadius: '1rem', fontSize: '1rem' }} onClick={() => setStep(2)}>
            Begin Pilot Briefing <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── STEP 2: FIRST INVENTORY ── */}
      {step === 2 && (
        <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
          <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Beaker style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>STEP 01/03</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Initial Inventory</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>What compound do you currently have in your possession?</p>
          
          <div className="form-group">
            <label className="form-label">Compound Name</label>
            <input 
              className="form-input" 
              placeholder="e.g. Testosterone Cypionate" 
              value={vialData.compounds?.[0].name}
              onChange={(e) => setVialData({...vialData, compounds: [{ ...vialData.compounds![0], name: e.target.value }]})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Concentration (mg/mL)</label>
              <input 
                type="number"
                className="form-input" 
                value={vialData.compounds?.[0].mass_mg}
                onChange={(e) => setVialData({...vialData, compounds: [{ ...vialData.compounds![0], mass_mg: parseFloat(e.target.value) }]})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Volume (mL)</label>
              <input 
                type="number"
                className="form-input" 
                value={vialData.volume_ml}
                onChange={(e) => setVialData({...vialData, volume_ml: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
            disabled={!vialData.compounds?.[0].name}
            onClick={() => setStep(3)}
          >
            Confirm Inventory Object <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── STEP 3: INITIAL PROTOCOL ── */}
      {step === 3 && (
        <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
          <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#f59e0b20', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Syringe style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.1em' }}>STEP 02/03</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Protocol Calibration</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Define your dosage and frequency for {vialData.compounds?.[0].name}.</p>
          
          <div className="form-group">
            <label className="form-label">Dose Amount (mg)</label>
            <input 
              type="number" 
              className="form-input" 
              value={protocolData.dose_amount}
              onChange={(e) => setProtocolData({...protocolData, dose_amount: parseFloat(e.target.value)})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <div className="seg-control" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button 
                className={`seg-btn ${protocolData.frequency_hours === 24 ? 'active' : ''}`}
                onClick={() => setProtocolData({...protocolData, frequency_hours: 24})}
              >Daily</button>
              <button 
                className={`seg-btn ${protocolData.frequency_hours === 84 ? 'active' : ''}`}
                onClick={() => setProtocolData({...protocolData, frequency_hours: 84})}
              >E3.5D</button>
              <button 
                className={`seg-btn ${protocolData.frequency_hours === 168 ? 'active' : ''}`}
                onClick={() => setProtocolData({...protocolData, frequency_hours: 168})}
              >Weekly</button>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}
            onClick={() => setStep(4)}
          >
            Finalize Calibration <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── STEP 4: REVIEW ── */}
      {step === 4 && (
        <div className="animate-fadeIn">
          <div style={{ width: '64px', height: '64px', background: 'var(--primary-muted)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Pilot Check-out</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.6 }}>
            You are initiating monitoring for <strong>{vialData.compounds?.[0].name}</strong> at <strong>{protocolData.dose_amount}mg</strong> every <strong>{protocolData.frequency_hours === 24 ? 'day' : protocolData.frequency_hours === 84 ? '3.5 days' : 'week'}</strong>.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }} onClick={() => setStep(3)} disabled={isProvisioning}>Adjust</button>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={handleFinish} disabled={isProvisioning}>
              {isProvisioning ? "Provisioning..." : "Activate Dashboard"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: SUCCESS ── */}
      {step === 5 && (
        <div className="animate-fadeIn">
          <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 style={{ width: '40px', height: '40px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Environment Ready</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem' }}>Your initial objects have been instantiated. Your dashboard is now tailored to your protocol.</p>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => window.location.reload()}>
            Enter Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
