"use client";

import { useState } from "react";
import { ChevronRight, Target, Flame, Heart, Zap, Sparkles, CheckCircle2, Shield, Activity, Calendar, ArrowRight, ArrowLeft, Beaker, Syringe, PlusCircle, Trash2 } from "lucide-react";
import { getReplicache, Vial, Protocol } from "@/replicache";
import { COMPOUND_DATABASE } from "@/lib/compoundsDb";

interface OnboardingVial {
  id: string; // temp id for UI
  name: string;
  status: 'mixed' | 'pill' | 'powder';
  volume_ml: number;
  mass_mg: number;
  unit: 'mg' | 'g' | 'IU';
  activeCycle: false | {
    dose_amount: number;
    frequency_hours: number;
  };
}

export function EmptyStateQA({ userId }: { userId: string }) {
  const [step, setStep] = useState(1);
  const [vials, setVials] = useState<OnboardingVial[]>([{
    id: crypto.randomUUID(),
    name: "",
    status: 'mixed',
    volume_ml: 10,
    mass_mg: 200,
    unit: 'mg',
    activeCycle: false
  }]);
  
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleFinish = async () => {
    setIsProvisioning(true);
    const rep = getReplicache(userId);
    if (!rep) return;

    for (const v of vials) {
      if (!v.name) continue; // skip empties
      
      const vialId = crypto.randomUUID();
      const finalVial: Vial = {
        id: vialId,
        name: v.name,
        compounds: [{ name: v.name, mass_mg: v.mass_mg, unit: v.unit }],
        volume_ml: v.volume_ml,
        remaining_volume_ml: v.volume_ml,
        status: v.status,
      };

      await rep.mutate.createVial(finalVial);

      // If they chose to build an active cycle for this compound
      if (v.activeCycle) {
        const finalProtocol: Protocol = {
          id: crypto.randomUUID(),
          vial_id: vialId,
          dose_amount: v.activeCycle.dose_amount,
          frequency_hours: v.activeCycle.frequency_hours,
          start_time: Date.now(),
          dose_unit: v.unit
        };
        await rep.mutate.createProtocol(finalProtocol);
      }
    }
    
    setIsProvisioning(false);
    setStep(5);
  };

  const currentVialIndex = step === 2 ? vials.length - 1 : 0; // Not strictly needed for multi-list, but keeping for reference if needed

  return (
    <div className="card" style={{ padding: '2.5rem', maxWidth: '640px', margin: '2rem auto', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      <datalist id="compounds-list">
        {COMPOUND_DATABASE.map((comp) => <option key={comp} value={comp} />)}
      </datalist>

      {/* ── STEP 1: WELCOME & FEATURES ── */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'var(--primary-muted)', borderRadius: '99px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
            WELCOME TO BIOTRACKER V1.1
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Full Capability Build-out</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            The professional standard for tracking compound integrity, inventory levels, and pharmacological saturation. Let's build your active monitoring perimeter.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '3rem', textAlign: 'left' }}>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Shield style={{ color: 'var(--primary)', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Integrity</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Full inventory tracking and cache loss prevention.</p>
            </div>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Activity style={{ color: 'var(--success)', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>PK Analysis</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Real-time blood concentration modeling.</p>
            </div>
            <div className="landing-card" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <Calendar style={{ color: 'var(--primary)', width: '20px', height: '20px', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Scheduling</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>Intelligent dose clustering and cycle management.</p>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '1.125rem', borderRadius: '1rem', fontSize: '1rem' }} onClick={() => setStep(2)}>
            Begin Inventory Sequence <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── STEP 2: FULL INVENTORY ── */}
      {step === 2 && (
        <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
          <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Beaker style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>PHASE 01/03</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Initial Capability</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Define all physical compounds currently in your possession. You can stash items you aren't actively using yet.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {vials.map((vial, index) => (
              <div key={vial.id} style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', position: 'relative' }}>
                {vials.length > 1 && (
                  <button 
                    onClick={() => setVials(vials.filter(v => v.id !== vial.id))}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div style={{ marginBottom: '1rem', paddingRight: '2rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Compound {index + 1}</label>
                  <input 
                    className="form-input" 
                    placeholder="Type to search compound..." 
                    list="compounds-list"
                    value={vial.name}
                    onChange={(e) => {
                      const newVials = [...vials];
                      newVials[index].name = e.target.value;
                      setVials(newVials);
                    }}
                    style={{ background: 'var(--background)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Concentration ({vial.unit}/mL)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      value={vial.mass_mg || ''}
                      onChange={(e) => {
                        const newVials = [...vials];
                        newVials[index].mass_mg = parseFloat(e.target.value);
                        setVials(newVials);
                      }}
                      style={{ background: 'var(--background)' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Total Volume (mL)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      value={vial.volume_ml || ''}
                      onChange={(e) => {
                        const newVials = [...vials];
                        newVials[index].volume_ml = parseFloat(e.target.value);
                        setVials(newVials);
                      }}
                      style={{ background: 'var(--background)' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={() => setVials([...vials, { id: crypto.randomUUID(), name: "", status: 'mixed', volume_ml: 10, mass_mg: 200, unit: 'mg', activeCycle: false }])}
            style={{ width: '100%', padding: '1rem', border: '2px dashed var(--border)', borderRadius: '1rem', background: 'none', color: 'var(--muted-foreground)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}
          >
            <PlusCircle className="h-5 w-5" /> Add Another Compound
          </button>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={!vials[0].name}
            onClick={() => {
              // Ensure we only proceed with named compounds
              setVials(vials.filter(v => v.name.trim() !== ""));
              setStep(3);
            }}
          >
            Confirm Physical Stash <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── STEP 3: INITIAL PROTOCOL SETUP ── */}
      {step === 3 && (
        <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
          <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--primary-muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Syringe style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>PHASE 02/03</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Active Protocols</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Which of your items are you actively taking today? Define the doses below.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {vials.map((vial, index) => (
              <div key={vial.id} style={{ border: `2px solid ${vial.activeCycle ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '1rem', padding: '1rem', transition: 'all 0.2s', background: vial.activeCycle ? 'rgba(245, 158, 11, 0.05)' : 'var(--input-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: vial.activeCycle ? '1rem' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={!!vial.activeCycle} 
                      onChange={(e) => {
                        const newVials = [...vials];
                        newVials[index].activeCycle = e.target.checked ? { dose_amount: 50, frequency_hours: 84 } : false;
                        setVials(newVials);
                      }}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 800 }}>{vial.name}</span>
                  </div>
                  {!vial.activeCycle && <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>STASH ONLY</span>}
                </div>

                {vial.activeCycle && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', paddingLeft: '1.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Dose Amount ({vial.unit})</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={vial.activeCycle.dose_amount}
                        onChange={(e) => {
                          const newVials = [...vials];
                          if (newVials[index].activeCycle) {
                            (newVials[index].activeCycle as any).dose_amount = parseFloat(e.target.value);
                          }
                          setVials(newVials);
                        }}
                        style={{ background: 'var(--background)' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Frequency</label>
                      <div className="seg-control" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <button 
                          className={`seg-btn ${vial.activeCycle.frequency_hours === 12 ? 'active' : ''}`}
                          style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                          onClick={() => {
                            const newVials = [...vials];
                            if (newVials[index].activeCycle) {
                              (newVials[index].activeCycle as any).frequency_hours = 12;
                            }
                            setVials(newVials);
                          }}
                        >Twice</button>
                        <button 
                          className={`seg-btn ${vial.activeCycle.frequency_hours === 24 ? 'active' : ''}`}
                          style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                          onClick={() => {
                            const newVials = [...vials];
                            if (newVials[index].activeCycle) {
                              (newVials[index].activeCycle as any).frequency_hours = 24;
                            }
                            setVials(newVials);
                          }}
                        >Daily</button>
                        <button 
                          className={`seg-btn ${vial.activeCycle.frequency_hours === 84 ? 'active' : ''}`}
                          style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                          onClick={() => {
                            const newVials = [...vials];
                            if (newVials[index].activeCycle) {
                              (newVials[index].activeCycle as any).frequency_hours = 84;
                            }
                            setVials(newVials);
                          }}
                        >E3.5D</button>
                        <button 
                          className={`seg-btn ${vial.activeCycle.frequency_hours === 168 ? 'active' : ''}`}
                          style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                          onClick={() => {
                            const newVials = [...vials];
                            if (newVials[index].activeCycle) {
                              (newVials[index].activeCycle as any).frequency_hours = 168;
                            }
                            setVials(newVials);
                          }}
                        >Weekly</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: 'auto' }}
            onClick={() => setStep(4)}
          >
            Review Build <ArrowRight className="ml-2 h-5 w-5" />
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
            You are registering <strong>{vials.length}</strong> items into your physical inventory cache, and initiating active monitoring for <strong>{vials.filter(v => v.activeCycle).length}</strong> protocols.
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
            <CheckCircle2 style={{ width: '40px', height: '40px', color: 'var(--success)' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Environment Ready</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem' }}>Your initial configuration is loaded. Your dashboard is tailored to your objects.</p>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => window.location.reload()}>
            Enter Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
