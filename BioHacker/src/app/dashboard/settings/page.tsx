"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Protocol, DoseLog } from "@/replicache";
import { Smartphone, Shield, Download, AlertTriangle, Calendar, Copy, Check, Beaker, Wand2 } from "lucide-react";
import { nanoid } from "nanoid";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmzvczfnqlvqvrsnnxj.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PImzukJvV70WqN1GwWUtuQ_ewZGSmoe'
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const rep = getReplicache(user?.id);
  const vials = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "vial/" }).values().toArray() as Vial[];
  }, { default: [] });
  const protocols = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "protocol/" }).values().toArray() as Protocol[];
  }, { default: [] });

  const handleExportBackup = () => {
    const backup = { timestamp: Date.now(), vials, protocols, user: user?.email };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biohacker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleSeedDemo = async () => {
    if (!rep || !confirm("This will add sample vials and protocols to your account. Continue?")) return;
    setSeeding(true);

    const demoVials: Vial[] = [
      { id: nanoid(), name: 'BPC-157 (Recovery)', compounds: [{name: 'BPC-157', mass_mg: 5, unit: 'mg'}], volume_ml: 2, remaining_volume_ml: 1.85, status: 'mixed' },
      { id: nanoid(), name: 'HGH (Performance)', compounds: [{name: 'Somatropin', mass_mg: 36, unit: 'IU'}], volume_ml: 5, remaining_volume_ml: 4.5, status: 'mixed' },
      { id: nanoid(), name: 'Anavar (Oral)', compounds: [{name: 'Oxandrolone', mass_mg: 10, unit: 'mg'}], volume_ml: 0, remaining_volume_ml: 0, status: 'pill', pill_count: 48 },
      { id: nanoid(), name: 'TB-500 (Stockpile)', compounds: [{name: 'TB-500', mass_mg: 5, unit: 'mg'}], volume_ml: 0, remaining_volume_ml: 0, status: 'powder' }
    ];

    const demoProtocols: Protocol[] = [
      { id: nanoid(), vial_id: demoVials[0].id, dose_amount: 250, frequency_hours: 24, days_on: 7, days_off: 0, start_time: Date.now() },
      { id: nanoid(), vial_id: demoVials[2].id, dose_amount: 2, frequency_hours: 24, days_on: 7, days_off: 0, start_time: Date.now() }
    ];

    const demoLogs: DoseLog[] = [
      { id: nanoid(), vial_id: demoVials[0].id, substance: demoVials[0].name, dose_amount: 250, unit: 'mcg', units_iu: 10, timestamp: Date.now() - 86400000 }
    ];

    await rep.mutate.seedDemoData({ vials: demoVials, protocols: demoProtocols, logs: demoLogs });
    setSeeding(false);
    alert("Demo Data Seeded Successfully!");
  };

  const calendarUrl = user ? `https://biohacker.minmaxmuscle.com/api/calendar/${user.id}` : "";

  if (!user) return null;

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your clinical integrations and data safety.</p></header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* iCal Integration */}
        <div className="card border-primary bg-primary/5">
          <div className="card-header"><h3 className="card-title text-primary"><Calendar className="h-5 w-5" /> Calendar Sync</h3><p className="card-description">Get native dose reminders on all your devices.</p></div>
          <div className="card-content space-y-6">
            <div className="p-4 bg-background border border-border rounded-lg">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">iCal Feed URL</label>
              <div className="flex gap-2">
                <input className="form-input text-xs font-mono bg-muted/20" readOnly value={calendarUrl} />
                <button onClick={() => { navigator.clipboard.writeText(calendarUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn btn-primary px-3">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">iPhone Sync Instructions:</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar. Paste the URL above.</p>
            </div>
          </div>
        </div>

        {/* Data & Tools */}
        <div className="space-y-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title"><Beaker className="h-5 w-5 text-primary" /> Setup Tools</h3><p className="card-description">Speed up your clinical environment setup.</p></div>
            <div className="card-content space-y-4">
              <div className="p-4 bg-muted/10 border border-border rounded-lg">
                <p className="text-sm font-semibold mb-1">One-Click Demo Seeder</p>
                <p className="text-xs text-muted-foreground mb-4">Instantly populate your account with sample vials (BPC, HGH, Anavar) and protocols to see how the app works.</p>
                <button onClick={handleSeedDemo} disabled={seeding} className="btn btn-primary w-full flex gap-2 justify-center bg-success hover:bg-success/90 border-none">
                  {seeding ? "Seeding..." : <><Wand2 className="h-4 w-4" /> Seed Sample Data</>}
                </button>
              </div>
              <button onClick={handleExportBackup} className="btn btn-outline w-full flex gap-2 justify-center"><Download className="h-4 w-4" /> Download Backup File</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title text-destructive"><AlertTriangle className="h-5 w-5" /> Danger Zone</h3></div>
            <div className="card-content">
              <button className="btn btn-outline border-destructive/20 text-destructive hover:bg-destructive/10 w-full text-xs">Purge All Account Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
