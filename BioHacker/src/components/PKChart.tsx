"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { Activity } from 'lucide-react';
import { useSubscribe } from "replicache-react";
import { getReplicache, DoseLog, Vial } from "@/replicache";
import { calculateEliminationConstant } from "@/pk";
import Decimal from "decimal.js";

export function PKChart({ userId }: { userId: string }) {
  const rep = getReplicache(userId);

  const logs = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "log/" }).values().toArray();
    return list as DoseLog[];
  }, { default: [] });

  const vials = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "vial/" }).values().toArray();
    return list as Vial[];
  }, { default: [] });

  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    const startTime = now - (72 * 3600000); // 3 days ago
    const endTime = now + (48 * 3600000); // 2 days ahead
    
    for (let t = startTime; t <= endTime; t += 3600000) { // 1 hour steps
      let totalSerum = new Decimal(0);

      logs.forEach(log => {
        const timeDiffHours = (t - log.timestamp) / 3600000;
        if (timeDiffHours >= 0) {
          // Find the vial to get half-life or default to 24h
          const halfLife = 24; // Default half-life in hours
          const k = calculateEliminationConstant(halfLife);
          const level = new Decimal(log.dose_amount).times(Math.exp(-k * timeDiffHours));
          totalSerum = totalSerum.plus(level);
        }
      });

      data.push({
        time: t,
        displayTime: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: totalSerum.toNumber(),
      });
    }
    return data;
  }, [logs]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Activity className="h-5 w-5 text-primary" />
          Serum Concentration Model
        </h3>
        <p className="card-description">Modeled blood levels based on injection history (72h past, 48h future)</p>
      </div>
      <div className="card-content">
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="time" 
                hide 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={10} 
                tickFormatter={(val) => `${val.toFixed(0)}`}
              />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="var(--primary)" 
                fillOpacity={1} 
                fill="url(#colorLevel)" 
                strokeWidth={2}
              />
              <ReferenceLine x={Date.now()} stroke="var(--destructive)" label={{ position: 'top', value: 'NOW', fill: 'var(--destructive)', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
