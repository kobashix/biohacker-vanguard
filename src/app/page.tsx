import { ReconstitutionEngine } from "@/components/ReconstitutionEngine";
import { PKChart } from "@/components/PKChart";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          Vanguard Pro <span className="header-badge">v2.0</span>
        </div>
        <div className="encryption-badge">
          <ShieldCheck className="h-4 w-4" />
          JWE Client-Side Encryption Active
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <ReconstitutionEngine />
          <InventoryAlerts />
        </aside>

        <section className="content-area">
          <PKChart />
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Zero-Knowledge Architecture</h3>
              <p className="card-description">Security guarantees for your telemetry data</p>
            </div>
            <div className="card-content">
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                <div style={{ padding: "1rem", backgroundColor: "var(--background)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>WebCrypto API</h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>All drug and dose data are encrypted locally before transmission. The server only sees JWE strings.</p>
                </div>
                <div style={{ padding: "1rem", backgroundColor: "var(--background)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>PostgreSQL RLS</h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Multi-tenant isolation enforced at the database level using Supabase Row-Level Security.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
