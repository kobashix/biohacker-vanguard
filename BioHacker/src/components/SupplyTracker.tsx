"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useSubscribe } from "replicache-react";
import { getReplicache, Supply } from "@/replicache";

export function SupplyTracker({ userId, initialAction }: { userId: string; initialAction?: string }) {
  const [name, setName] = useState("");
  const [count, setCount] = useState("100");
  const [unit, setUnit] = useState("pcs");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (initialAction === 'add') setIsAdding(true);
  }, [initialAction]);

  const rep = getReplicache(userId);
  const supplies = useSubscribe(rep, async (tx) => {
    const list = await tx.scan({ prefix: "supply/" }).values().toArray();
    return list as Supply[];
  }, { default: [] });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    await rep.mutate.updateSupply({ id: crypto.randomUUID(), name, count: parseInt(count), unit });
    setName(""); setCount("100"); setUnit("pcs"); setIsAdding(false);
  };

  const adjustCount = async (supply: Supply, delta: number) => {
    if (!rep) return;
    await rep.mutate.updateSupply({ ...supply, count: Math.max(0, supply.count + delta) });
  };

  return (
    <>
      {isAdding && (
        <div className="sheet-overlay">
          <div className="sheet-inner">
            <div className="sheet-header">
              <button className="sheet-back-btn" onClick={() => setIsAdding(false)}>
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="sheet-title">Add to Inventory Stash</span>
            </div>

            <form onSubmit={handleAdd}>
              <div className="sheet-section">
                <p className="sheet-section-label">Item Name</p>
                <input
                  className="form-input"
                  style={{ background: 'var(--input-bg)', color: 'var(--foreground)', fontSize: '1rem', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid var(--border)' }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. 31G Insulin Syringes"
                  autoFocus
                  required
                />
              </div>

              <div className="sheet-section">
                <p className="sheet-section-label">Starting Count</p>
                <input className="big-input" type="number" inputMode="numeric" value={count} onChange={e => setCount(e.target.value)} required />
              </div>

              <div className="sheet-section">
                <p className="sheet-section-label">Unit</p>
                <div className="seg-control" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                  {['pcs', 'mL', 'vials', 'boxes'].map(u => (
                    <button key={u} type="button" className={`seg-btn ${unit === u ? 'active' : ''}`} onClick={() => setUnit(u)}>{u}</button>
                  ))}
                </div>
                <input
                  className="form-input"
                  style={{ marginTop: '0.5rem', background: 'var(--input-bg)', color: 'var(--foreground)', border: '2px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Or type a custom unit"
                />
              </div>

              <button type="submit" className="sheet-cta">Add to Stash</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h3 className="card-title"><Package className="h-5 w-5 text-primary" /> Inventory Stash</h3>
            <p className="card-description">Supplies, wipes, water &amp; more.</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn btn-outline p-2">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="card-content">
          {supplies.length === 0 ? (
            <button
              onClick={() => setIsAdding(true)}
              style={{ width: '100%', padding: '2rem 1rem', border: '2px dashed var(--border)', borderRadius: '0.875rem', color: 'var(--muted-foreground)', background: 'none', cursor: 'pointer', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <Package className="h-8 w-8" style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p>No supplies tracked yet</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>Tap to add supplies, wipes, water</p>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {supplies.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '0.875rem 1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>{s.name}</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.count < 10 ? 'var(--destructive)' : 'var(--primary)', lineHeight: 1.2 }}>
                      {s.count} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{s.unit}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        const newVal = prompt(`Inventory Check — Enter exact new count for ${s.name} (Current: ${s.count}):`, s.count.toString());
                        if (newVal !== null) {
                          const num = parseInt(newVal);
                          if (!isNaN(num) && num >= 0) {
                            adjustCount(s, num - s.count);
                          } else {
                            alert("Invalid number. Count not updated.");
                          }
                        }
                      }}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Audit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`WARNING: Remove ${s.name} from the Strategic Stockpile completely?`)) {
                          if (confirm(`Are you absolutely certain? This will delete the item record to prevent accidental cache loss.`)) {
                            rep?.mutate.updateSupply({ ...s, count: -999 });
                          }
                        }
                      }}
                      style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setIsAdding(true)} style={{ border: '2px dashed var(--border)', borderRadius: '0.875rem', padding: '0.75rem', color: 'var(--muted-foreground)', background: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
