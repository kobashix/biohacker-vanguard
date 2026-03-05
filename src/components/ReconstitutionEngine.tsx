"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { calculateRequiredUnits, validateDoseSafety, SYRINGE_SCALES } from "@/lib/math";

export function ReconstitutionEngine() {
  const [mass, setMass] = useState<string>("5"); // mg
  const [volume, setVolume] = useState<string>("2"); // mL
  const [dose, setDose] = useState<string>("250"); // mcg
  const [selectedSyringe, setSelectedSyringe] = useState<number>(1.0); // 1.0mL default

  const requiredUnits = calculateRequiredUnits(mass, volume, dose);
  const safety = validateDoseSafety(requiredUnits, selectedSyringe);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Calculator className="h-5 w-5 text-primary" />
          Reconstitution & Math Engine
        </h3>
        <p className="card-description">Precision dosing using Decimal.js</p>
      </div>
      <div className="card-content">
        <div className="form-group">
          <label className="form-label">Lyophilized Peptide Mass (mg)</label>
          <input 
            type="number" 
            className="form-input" 
            value={mass} 
            onChange={(e) => setMass(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Bacteriostatic Water Volume (mL)</label>
          <input 
            type="number" 
            className="form-input" 
            value={volume} 
            onChange={(e) => setVolume(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Target Dose (mcg)</label>
          <input 
            type="number" 
            className="form-input" 
            value={dose} 
            onChange={(e) => setDose(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Syringe Scale</label>
          <select 
            className="form-input"
            value={selectedSyringe}
            onChange={(e) => setSelectedSyringe(parseFloat(e.target.value))}
          >
            {Object.values(SYRINGE_SCALES).map(s => (
              <option key={s.capacity_ml} value={s.capacity_ml}>{s.label}</option>
            ))}
          </select>
        </div>
        
        <div className="metric-grid" style={{ marginTop: "1.5rem" }}>
          <div className="metric-item">
            <span className="metric-label">Required Volume</span>
            <span className="metric-value">
              {requiredUnits.isFinite() ? requiredUnits.toDecimalPlaces(1).toString() : "0"} <span style={{fontSize: "1rem", color: "var(--muted-foreground)"}}>IU</span>
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Accuracy</span>
            <span className="metric-value" style={{fontSize: "1.25rem", color: safety.isValid ? 'var(--success)' : 'var(--destructive)'}}>
              {safety.isValid ? "Optimal" : "Check Alerts"}
            </span>
          </div>
        </div>

        {!safety.isValid && (
          <div className="alert-box">
            <div style={{fontWeight: 600}}>Safety Guardrail Triggered</div>
            {safety.errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
