"use client";

import { PackageOpen } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial } from "@/replicache";
import { estimateRemainingDoses } from "@/inventory";

export function InventoryAlerts({ userId }: { userId: string }) {
  const rep = getReplicache(userId);

  // Filter for mixed (liquid) or pill vials for the predictive depletion math
  const activeVials = useSubscribe(
    rep,
    async (tx) => {
      const list = await tx.scan({ prefix: "vial/" }).values().toArray();
      return (list as Vial[]).filter(v => v.status === 'mixed' || v.status === 'pill');
    },
    { default: [] }
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <PackageOpen className="h-5 w-5 text-primary" />
          Active Monitoring
        </h3>
        <p className="card-description">Predictive depletion for active compounds</p>
      </div>
      <div className="card-content" style={{ padding: "0" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Remaining</th>
                <th>Est. Doses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeVials.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                    No active (mixed or pill) compounds found.
                  </td>
                </tr>
              )}
              {activeVials.map((item) => {
                // For estimation: 25 IU for liquid, 1 pill for orals
                const doseVal = item.status === 'pill' ? 1 : 25;
                const doses = estimateRemainingDoses(item, doseVal);
                const isLow = doses < 5;
                
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      {item.status === 'pill' 
                        ? `${item.remaining_pills} pills` 
                        : `${item.remaining_volume_ml.toFixed(2)} mL`}
                    </td>
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
