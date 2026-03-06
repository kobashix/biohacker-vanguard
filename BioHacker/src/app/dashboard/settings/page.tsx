"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSubscribe } from "replicache-react";
import { getReplicache, Vial, Protocol, DoseLog } from "@/replicache";
import { Bell, Smartphone, Shield, Download, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  if (!user) return null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System preferences and data safety.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Safety (NEW) */}
        <div className="card border-primary">
          <div className="card-header">
            <h3 className="card-title text-primary"><Shield className="h-5 w-5" /> Data Preservation</h3>
            <p className="card-description">Export your inventory and protocols for safety.</p>
          </div>
          <div className="card-content space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-semibold mb-2">Clinical Backup</p>
              <p className="text-xs text-muted-foreground mb-4">Download your entire configuration as a JSON file. You can use this to restore your setup if the server is reset.</p>
              <button onClick={handleExportBackup} className="btn btn-primary w-full flex gap-2 justify-center">
                <Download className="h-4 w-4" /> Download Backup File
              </button>
            </div>
          </div>
        </div>

        {/* Integration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Smartphone className="h-5 w-5" /> Device Sync</h3>
            <p className="card-description">Calendar integration settings.</p>
          </div>
          <div className="card-content">
            <p className="text-xs text-muted-foreground">iCal Feed: https://biohacker.minmaxmuscle.com/api/calendar/{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
