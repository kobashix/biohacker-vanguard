"use client";

import { useState } from "react";
import { ChevronRight, Target, Flame, Heart, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { getReplicache, Vial, Protocol } from "@/replicache";

type GoalId = 'mass' | 'healing' | 'longevity' | 'trt' | 'cutting';

interface GoalOption {
  id: GoalId;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const GOALS: GoalOption[] = [
  { id: 'mass',      label: 'Mass Builder',    description: 'Focus on hypertrophy and strength gains.', icon: Zap,      color: '#f59e0b' },
  { id: 'healing',   label: 'Injury Recovery', description: 'Accelerate connective tissue and nerve repair.', icon: Flame,    color: '#ef4444' },
  { id: 'longevity', label: 'Vitality & Age',  description: 'GHRH/GHRP pulses for cellular health.',  icon: Sparkles, color: '#8b5cf6' },
  { id: 'trt',       label: 'TRT Optimization', description: 'Biological hormone replacement support.', icon: Heart,    color: '#3b82f6' },
  { id: 'cutting',   label: 'Physique Tuning',  description: 'Metabolic acceleration and fat loss.',   icon: Target,   color: '#10b981' },
];

export function EmptyStateQA({ userId }: { userId: string }) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalId | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleGoalSelect = async (goal: GoalId) => {
    setSelectedGoal(goal);
    setStep(2);
  };

  const provisionProtocol = async () => {
    setIsProvisioning(true);
    const rep = getReplicache(userId);
    if (!rep) return;

    const now = Date.now();
    let vials: Vial[] = [];
    let protocols: Protocol[] = [];

    if (selectedGoal === 'healing') {
      const bpcId = crypto.randomUUID();
      const tbId = crypto.randomUUID();
      vials = [
        { 
          id: bpcId, name: 'BPC-157 5mg', 
          compounds: [{ name: 'BPC-157', mass_mg: 5, unit: 'mg' }], 
          volume_ml: 2, remaining_volume_ml: 2, status: 'mixed' 
        },
        { 
          id: tbId,  name: 'TB-500 10mg', 
          compounds: [{ name: 'TB-500', mass_mg: 10, unit: 'mg' }], 
          volume_ml: 5, remaining_volume_ml: 5, status: 'mixed' 
        }
      ];
      protocols = [
        { id: crypto.randomUUID(), vial_id: bpcId, dose_amount: 250, dose_unit: 'mcg', frequency_hours: 24, start_time: now },
        { id: crypto.randomUUID(), vial_id: tbId,  dose_amount: 500, dose_unit: 'mcg', frequency_hours: 24, start_time: now }
      ];
    } else if (selectedGoal === 'mass') {
      const ghrpId = crypto.randomUUID();
      vials = [{ 
        id: ghrpId, name: 'CJC-1295 + Ipamorelin', 
        compounds: [{ name: 'CJC/Ipam', mass_mg: 10, unit: 'mg' }], 
        volume_ml: 5, remaining_volume_ml: 5, status: 'mixed' 
      }];
      protocols = [{ id: crypto.randomUUID(), vial_id: ghrpId, dose_amount: 100, dose_unit: 'mcg', frequency_hours: 24, start_time: now }];
    } else if (selectedGoal === 'longevity' || selectedGoal === 'trt') {
       const hghId = crypto.randomUUID();
       vials = [{ 
         id: hghId, name: 'HGH (Somatropin)', 
         compounds: [{ name: 'HGH', mass_mg: 10, unit: 'mg' }], 
         volume_ml: 3, remaining_volume_ml: 3, status: 'mixed' 
       }];
       protocols = [{ id: crypto.randomUUID(), vial_id: hghId, dose_amount: 2, dose_unit: 'IU', frequency_hours: 24, start_time: now }];
    }

    if (vials.length === 0) {
      const bpcId = crypto.randomUUID();
      vials = [{ 
        id: bpcId, name: 'BPC-157 5mg', 
        compounds: [{ name: 'BPC-157', mass_mg: 5, unit: 'mg' }], 
        volume_ml: 2, remaining_volume_ml: 2, status: 'mixed' 
      }];
      protocols = [{ id: crypto.randomUUID(), vial_id: bpcId, dose_amount: 250, dose_unit: 'mcg', frequency_hours: 24, start_time: now }];
    }

    // Mutate
    for (const v of vials) await rep.mutate.createVial(v);
    for (const p of protocols) await rep.mutate.createProtocol(p);

    setIsProvisioning(false);
    setStep(3);
  };

  return (
    <div className="card" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome to BioTracker</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Let's personalize your clinical dashboard. What is your primary focus?</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {GOALS.map((g) => (
              <button 
                key={g.id}
                onClick={() => handleGoalSelect(g.id)}
                className="btn-outline"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', 
                  textAlign: 'left', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <g.icon style={{ width: '18px', height: '18px', color: g.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{g.description}</div>
                </div>
                <ChevronRight style={{ marginLeft: 'auto', width: '1.25rem', height: '1.25rem', opacity: 0.3 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary-muted)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px rgba(37,99,235,0.2)' }}>
            {(() => {
              const Icon = GOALS.find(g => g.id === selectedGoal)?.icon;
              return Icon ? <Icon style={{ width: '32px', height: '32px', color: 'var(--primary)' }} /> : null;
            })()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Initialize {GOALS.find(g => g.id === selectedGoal)?.label}?</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>We'll provision a starter template based on standard clinical best practices for this focus. You can modify your full protocol and dosages anytime.</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }} onClick={() => setStep(1)} disabled={isProvisioning}>Go Back</button>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={provisionProtocol} disabled={isProvisioning}>
              {isProvisioning ? "Provisioning..." : "Provision Environment"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 style={{ width: '40px', height: '40px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Environment Sterile & Ready</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>Your initial compounds and protocols have been injected into your device. Check your Home tab to see your new schedule.</p>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => window.location.reload()}>
            Enter Dashboard
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}
