"use client";

import { PackageOpen } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { estimateRemainingDoses } from "@/inventory";

export function InventoryAlerts({ userId }: { userId: string }) {
  const rep = getReplicache(userId);

  const vials = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "vial/" }).values().toArray();
      return list as Vial[];
    },
    { default: [] }
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <PackageOpen className="h-5 w-5 text-primary" />
          Adherence & Predictive Depletion
        </h3>
        <p className="card-description">Live stock monitoring based on logged doses</p>
      </div>
      <div className="card-content" style={{ padding: "0" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Compound</th>
                <th>Remaining</th>
                <th>Est. Doses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vials.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                    No inventory data available.
                  </td>
                </tr>
              )}
              {vials.map((item) => {
                const doses = estimateRemainingDoses(item.remaining_volume_ml, 25); // Using 25 IU as default estimate
                const isLow = doses < 5;
                
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.remaining_volume_ml.toFixed(2)} mL</td>
                    <td>{doses}</td>
                    <td>
                      <span 
                        className={`status-indicator ${!isLow ? 'status-active' : 'status-low'}`}
                      />
                      {!isLow ? "Active" : "Low Stock"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
