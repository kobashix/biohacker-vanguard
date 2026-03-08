"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, dropReplicache, Vial, Protocol, DoseLog, SubjectiveLog, Supply, Cycle } from "@/replicache";
import { Shield, Download, AlertTriangle, Calendar, Copy, Check, Beaker, Wand2, UploadCloud } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [purging, setPurging] = useState(false);
  
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
  const logs = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "log/" }).values().toArray() as DoseLog[];
  }, { default: [] });
  const subjectiveLogs = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "subjective/" }).values().toArray() as SubjectiveLog[];
  }, { default: [] });
  const supplies = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "supply/" }).values().toArray() as Supply[];
  }, { default: [] });
  const cycles = useSubscribe(rep, async (tx) => {
    return await tx.scan({ prefix: "cycle/" }).values().toArray() as Cycle[];
  }, { default: [] });

  const handlePurgeAll = async () => {
    if (!confirm('âš狢 This will permanently delete ALL your vials, protocols, logs, and supplies. This cannot be undone. Type DELETE in the next prompt to confirm.')) return;
    const typed = prompt('Type DELETE to confirm permanent data purge:');
    if (typed !== 'DELETE') return;

    setPurging(true);
    try {
      if (rep) {
        await rep.mutate.purgeAllData();
      }

      alert(`Purge Complete!\n\nAll Local and Server data has been queued for deletion.`);
      window.location.href = '/dashboard';
    } catch (e: any) {
      console.error(e);
      alert(`Purge failed: ${e.message}`);
    } finally {
      setPurging(false);
    }
  };

  const handleExportBackup = () => {
    const backup = { 
      timestamp: Date.now(), 
      user: user?.email,
      vials, protocols, logs, subjectiveLogs, supplies, cycles 
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biohacker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rep) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!confirm(`Restore backup from ${new Date(json.timestamp).toLocaleDateString()}? This is irreversible.`)) return;
        
        await rep.mutate.restoreBackup({
          vials: json.vials || [],
          protocols: json.protocols || [],
          logs: json.logs || [],
          subjectiveLogs: json.subjectiveLogs || [],
          supplies: json.supplies || [],
          cycles: json.cycles || []
        });

        alert("Backup restored successfully. The changes will sync to the server momentarily.");
      } catch (err) {
        alert("Invalid backup file format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleSeedDemo = async () => {
    if (!rep || !confirm("This will add demo data to your account including vials, logs, wellbeing entries, and gear stash. Continue?")) return;
    setSeeding(true);

    const bpcId = crypto.randomUUID();
    const hghId = crypto.randomUUID();
    const anavarId = crypto.randomUUID();
    const tirzeId = crypto.randomUUID();
    const testCId = crypto.randomUUID();

    const demoVials: Vial[] = [
      { id: bpcId,   name: 'BPC-157 (Recovery)',      compounds: [{name: 'BPC-157', mass_mg: 5, unit: 'mg'}],                                 volume_ml: 2,  remaining_volume_ml: 1.6,  status: 'mixed' },
      { id: hghId,   name: 'CJC-1295 + Ipamorelin',   compounds: [{name: 'CJC-1295 (No DAC / Mod GRF 1-29)', mass_mg: 2, unit: 'mg'}, {name: 'Ipamorelin', mass_mg: 2, unit: 'mg'}], volume_ml: 2, remaining_volume_ml: 1.3, status: 'mixed' },
      { id: testCId, name: 'Testosterone Cyp 200mg',   compounds: [{name: 'Testosterone Cypionate', mass_mg: 200, unit: 'mg'}],              volume_ml: 10, remaining_volume_ml: 7.5,  status: 'mixed' },
      { id: tirzeId, name: 'Tirzepatide 5mg',          compounds: [{name: 'Tirzepatide', mass_mg: 5, unit: 'mg'}],                           volume_ml: 1,  remaining_volume_ml: 0.6,  status: 'mixed' },
      { id: anavarId, name: 'Anavar 10mg (Oral)',       compounds: [{name: 'Oxandrolone (Anavar)', mass_mg: 10, unit: 'mg'}],                volume_ml: 0,  remaining_volume_ml: 0,    status: 'pill', pill_count: 42 },
    ];

    const demoProtocols: Protocol[] = [
      { id: crypto.randomUUID(), vial_id: bpcId,   dose_amount: 250,  frequency_hours: 24, days_on: 7, days_off: 0, start_time: Date.now() - 30 * 86400000 },
      { id: crypto.randomUUID(), vial_id: hghId,   dose_amount: 100,  frequency_hours: 24, days_on: 5, days_off: 2, start_time: Date.now() - 30 * 86400000 },
      { id: crypto.randomUUID(), vial_id: testCId, dose_amount: 100,  frequency_hours: 84, days_on: 7, days_off: 0, start_time: Date.now() - 30 * 86400000 },
      { id: crypto.randomUUID(), vial_id: tirzeId, dose_amount: 2500, frequency_hours: 168, days_on: 7, days_off: 0, start_time: Date.now() - 30 * 86400000 },
      { id: crypto.randomUUID(), vial_id: anavarId, dose_amount: 2,   frequency_hours: 24, days_on: 7, days_off: 0, start_time: Date.now() - 30 * 86400000 },
    ];

    // 30 days of dose logs
    const demoLogs: DoseLog[] = [];
    const now = Date.now();
    const msPerDay = 86400000;

    for (let i = 30; i >= 0; i--) {
      const ts = now - (i * msPerDay);
      demoLogs.push({ id: crypto.randomUUID(), vial_id: bpcId, substance: 'BPC-157 (Recovery)', dose_amount: 250, unit: 'mcg', units_iu: 10, timestamp: ts + 7 * 3600000 + Math.random() * 600000 });
      if (i % 2 === 0) {
        demoLogs.push({ id: crypto.randomUUID(), vial_id: testCId, substance: 'Testosterone Cyp 200mg', dose_amount: 100, unit: 'mg', units_iu: 50, timestamp: ts + 19 * 3600000 + Math.random() * 600000, injection_site: ['Left Glute', 'Right Glute', 'Left Delt', 'Right Delt'][i % 4] });
      }
      if (i % 7 !== 0 && i % 7 !== 6) {
        demoLogs.push({ id: crypto.randomUUID(), vial_id: hghId, substance: 'CJC-1295 + Ipamorelin', dose_amount: 100, unit: 'mcg', units_iu: 10, timestamp: ts + 21 * 3600000 + Math.random() * 600000 });
      }
      if (i % 7 === 0) {
        demoLogs.push({ id: crypto.randomUUID(), vial_id: tirzeId, substance: 'Tirzepatide 5mg', dose_amount: 2500, unit: 'mcg', units_iu: 25, timestamp: ts + 8 * 3600000 + Math.random() * 600000, injection_site: 'Belly (SubQ)' });
      }
      demoLogs.push({ id: crypto.randomUUID(), vial_id: anavarId, substance: 'Anavar 10mg (Oral)', dose_amount: 2, unit: 'tabs', units_iu: 0, timestamp: ts + 12 * 3600000 + Math.random() * 600000 });
    }

    // 30 days of wellbeing journal entries with realistic progression
    const subjectiveLogs: SubjectiveLog[] = [];
    for (let i = 30; i >= 0; i--) {
      const weekProgress = (30 - i) / 30; // 0 → 1 over 30 days
      const fluctuation = () => (Math.random() - 0.5) * 2;
      subjectiveLogs.push({
        id: crypto.randomUUID(),
        timestamp: now - (i * msPerDay) + 8 * 3600000,
        mood:          Math.min(10, Math.max(1, Math.round(5 + weekProgress * 3 + fluctuation()))),
        energy:        Math.min(10, Math.max(1, Math.round(5 + weekProgress * 3.5 + fluctuation()))),
        sleep_quality: Math.min(10, Math.max(1, Math.round(6 + weekProgress * 2 + fluctuation()))),
        soreness:      Math.min(10, Math.max(1, Math.round(5 - weekProgress * 3 + Math.abs(fluctuation())))),
        notes: i % 5 === 0 ? ['Great pump today, veins popping.', 'PIP minimal from yesterday. Feeling leaner.', 'Energy through the roof today. Sleep was perfect.', 'Tirzepatide week — appetite way down.', 'Recovery feeling dialed in. BPC working.'][i / 5 | 0] : '',
      });
    }

    // Gear stash supplies
    const demoSupplies: Supply[] = [
      { id: crypto.randomUUID(), name: '31G x 5/16" Insulin Syringes (BD)',   count: 87,  unit: 'pcs'   },
      { id: crypto.randomUUID(), name: 'Alcohol Prep Pads',                    count: 143, unit: 'pcs'   },
      { id: crypto.randomUUID(), name: 'Bacteriostatic Water 30mL',            count: 3,   unit: 'vials' },
      { id: crypto.randomUUID(), name: '23G x 1" IM Needles',                 count: 24,  unit: 'pcs'   },
      { id: crypto.randomUUID(), name: 'Sterile Saline 0.9% 10mL',            count: 6,   unit: 'vials' },
    ];

    await rep.mutate.seedDemoData({ vials: demoVials, protocols: demoProtocols, logs: demoLogs, subjectiveLogs, supplies: demoSupplies });
    setSeeding(false);
    alert("Demo data added! Vials, pins, wellbeing logs, and gear stash are all populated.");
  };

  const calendarUrl = user ? `https://biohacker.minmaxmuscle.com/api/calendar/${user.id}` : "";

  if (!user) return null;

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your clinical integrations and data safety.</p></header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
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
              <p className="text-[11px] text-muted-foreground leading-relaxed">Settings â†’ Calendar â†’ Accounts â†’ Add Account â†’ Other â†’ Add Subscribed Calendar. Paste the URL above.</p>
            </div>
          </div>
        </div>

        {/* Data & Tools */}
        <div className="space-y-6 lg:space-y-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title"><Beaker className="h-5 w-5 text-primary" /> Setup Tools</h3><p className="card-description">Speed up your clinical environment setup.</p></div>
            <div className="card-content space-y-4">
              <div className="p-4 bg-muted/10 border border-border rounded-lg">
                <p className="text-sm font-semibold mb-1">One-Click Demo Seeder</p>
                <p className="text-xs text-muted-foreground mb-4">Instantly populate your account with sample vials (BPC, HGH, Anavar) and protocols to see how the app works.</p>
                <button onClick={handleSeedDemo} disabled={seeding} className="btn btn-primary w-full flex gap-2 justify-center bg-success hover:bg-success/90 border-none">
                  {seeding ? "Adding Data..." : <><Wand2 className="h-4 w-4" /> Add Demo Data</>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleExportBackup} className="btn btn-outline flex gap-2 justify-center"><Download className="h-4 w-4" /> Download Backup</button>
                <label className="btn btn-outline flex gap-2 justify-center cursor-pointer">
                  <UploadCloud className="h-4 w-4" /> Restore Backup
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title text-destructive"><AlertTriangle className="h-5 w-5" /> Danger Zone</h3></div>
            <div className="card-content">
              <button onClick={handlePurgeAll} disabled={purging} className="btn btn-outline border-destructive/20 text-destructive hover:bg-destructive/10 w-full text-xs disabled:opacity-50">
                {purging ? 'Purging...' : 'Purge All Account Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

