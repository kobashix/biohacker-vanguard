"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, dropReplicache, Vial, Protocol, DoseLog, SubjectiveLog, Supply, Cycle } from "@/replicache";
import { generateDemoData } from "@/lib/demoData";
import { Shield, Download, AlertTriangle, Calendar, Copy, Check, Beaker, Wand2, UploadCloud, User } from "lucide-react";
import { toast } from "sonner";

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

      toast.success('Purge Complete! All Local and Server data has been queued for deletion.');
      setTimeout(() => window.location.href = '/dashboard', 1500);
    } catch (e: any) {
      console.error(e);
      toast.error(`Purge failed: ${e.message}`);
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

        toast.success("Backup restored successfully. The changes will sync to the server momentarily.");
      } catch (err) {
        toast.error("Invalid backup file format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleSeedDemo = async () => {
    if (!rep || !confirm("This will add demo data to your account including vials, logs, wellbeing entries, and gear stash. Continue?")) return;
    setSeeding(true);

    const data = generateDemoData();

    await rep.mutate.seedDemoData({
      vials: data.demoVials,
      protocols: data.demoProtocols,
      logs: data.demoLogs,
      subjectiveLogs: data.subjectiveLogs,
      supplies: data.demoSupplies,
      cycles: data.demoCycles
    });

    setSeeding(false);
    toast.success("Demo data added! Vials, pins, wellbeing journals, and inventory items are all populated.");
  };

  const [fullName, setFullName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const calendarUrl = user ? `https://biohacker.minmaxmuscle.com/api/calendar/${user.id}` : "";

  if (!user) return null;

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your clinical integrations and data safety.</p>
      </header>

      {/* Account Profile Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><User className="h-5 w-5 text-primary" /> Account Profile</h3>
          <p className="card-description">Your identity in the BioTracker network.</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input bg-muted/20" readOnly value={user.email} />
              <p className="text-[10px] text-muted-foreground mt-1">Managed via Supabase Auth</p>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="flex gap-2">
                <input
                  className="form-input"
                  placeholder="Clinical Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="btn btn-primary px-4"
                >
                  {updatingProfile ? "..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

