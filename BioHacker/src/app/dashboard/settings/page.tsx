"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Protocol, DoseLog } from "@/replicache";
import { Bell, Smartphone, Shield, Download, AlertTriangle, Calendar, Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
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
    const backup = {
      timestamp: Date.now(),
      vials,
      protocols,
      user: user?.email
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biohacker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const calendarUrl = user ? `https://biohacker.minmaxmuscle.com/api/calendar/${user.id}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calendarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your clinical integrations and data safety.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* iCal Integration */}
        <div className="card border-primary bg-primary/5">
          <div className="card-header">
            <h3 className="card-title text-primary"><Calendar className="h-5 w-5" /> Phone/PC Calendar Sync</h3>
            <p className="card-description">Get native dose reminders on all your devices.</p>
          </div>
          <div className="card-content space-y-6">
            <div className="p-4 bg-background border border-border rounded-lg">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Your Personal iCal Feed</label>
              <div className="flex gap-2">
                <input 
                  className="form-input text-xs font-mono bg-muted/20" 
                  readOnly 
                  value={calendarUrl} 
                />
                <button 
                  onClick={copyToClipboard}
                  className="btn btn-primary px-3"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-muted-foreground">How to Subscribe:</h4>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</div>
                  <p className="text-xs">Copy the unique **iCal URL** provided above.</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</div>
                  <div>
                    <p className="text-xs font-bold">On iPhone (iOS):</p>
                    <p className="text-[11px] text-muted-foreground">Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar. Paste the URL.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">3</div>
                  <div>
                    <p className="text-xs font-bold">On Google Calendar / Android:</p>
                    <p className="text-[11px] text-muted-foreground">Open Google Calendar on PC → Other Calendars (+) → From URL. Paste the URL. It will sync to your phone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Safety */}
        <div className="space-y-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Shield className="h-5 w-5" /> Data Preservation</h3>
              <p className="card-description">Manual backups for absolute data safety.</p>
            </div>
            <div className="card-content">
              <p className="text-xs text-muted-foreground mb-4">Download your clinical configuration as a JSON file. This includes all vials and scheduled protocols.</p>
              <button onClick={handleExportBackup} className="btn btn-outline w-full flex gap-2 justify-center">
                <Download className="h-4 w-4" /> Download Backup File
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-destructive"><AlertTriangle className="h-5 w-5" /> Danger Zone</h3>
            </div>
            <div className="card-content">
              <button className="btn btn-outline border-destructive/20 text-destructive hover:bg-destructive/10 w-full text-xs">Purge All Account Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
