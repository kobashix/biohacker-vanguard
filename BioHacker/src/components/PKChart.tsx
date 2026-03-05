"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { generatePKModel, Injection, Ester } from '@/lib/pk';

const CYPI_ESTER: Ester = { name: "Cypionate", half_life_hours: 192 }; // 8 days
const ACE_ESTER: Ester = { name: "Acetate", half_life_hours: 48 }; // 2 days

export function PKChart() {
  const injections: Injection[] = [
    { timestamp: new Date(Date.now() - 48 * 3600000), dose_mg: 100, ester: CYPI_ESTER },
    { timestamp: new Date(Date.now() - 24 * 3600000), dose_mg: 50, ester: ACE_ESTER },
    { timestamp: new Date(), dose_mg: 100, ester: CYPI_ESTER },
  ];

  const data = generatePKModel(injections, 168, 4); // 7 day projection, 4h steps

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Activity className="h-5 w-5 text-primary" />
          Multi-Compartment PK Modeling
        </h3>
        <p className="card-description">Cumulative serum levels for concurrent esters (Cyp vs Ace)</p>
      </div>
      <div className="card-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="time_hours" 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickFormatter={(val) => `${val}h`}
              />
              <YAxis 
                stroke="var(--primary)" 
                fontSize={12} 
                tickFormatter={(val) => `${val.toFixed(1)} mg`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line 
                type="monotone" 
                dataKey="serum_level" 
                name="Total Serum Level" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={false} 
              />
              <ReferenceLine y={150} label="Therapeutic Peak" stroke="var(--destructive)" strokeDasharray="3 3" />
              <ReferenceLine y={50} label="Minimum Stable" stroke="var(--success)" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
