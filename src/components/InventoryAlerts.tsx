"use client";

import { PackageOpen } from "lucide-react";
import Decimal from "decimal.js";
import { estimateRemainingDoses } from "@/lib/inventory";
import { NEEDLE_DEAD_SPACE_ML } from "@/lib/math";

export function InventoryAlerts() {
  const inventory = [
    { id: "1", name: "BPC-157 (5mg)", status: "Active", remaining_ml: new Decimal(2.1), avg_dose_iu: 25 },
    { id: "2", name: "TB-500 (10mg)", status: "Low Stock", remaining_ml: new Decimal(0.8), avg_dose_iu: 50 },
    { id: "3", name: "Ipamorelin (2mg)", status: "Active", remaining_ml: new Decimal(1.5), avg_dose_iu: 20 },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <PackageOpen className="h-5 w-5 text-primary" />
          Inventory & Adherence Logic
        </h3>
        <p className="card-description">Calibrated for {NEEDLE_DEAD_SPACE_ML.toString()}mL needle dead space</p>
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
              {inventory.map((item) => {
                const doses = estimateRemainingDoses(item.remaining_ml, item.avg_dose_iu);
                const isLow = doses < 5;
                
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.remaining_ml.toString()} mL</td>
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
