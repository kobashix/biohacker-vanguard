"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Bell, Smartphone, Globe, Shield } from "lucide-react";

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

  if (!user) return null;

  const calendarUrl = `https://biohacker.minmaxmuscle.com/api/calendar/${user.id}`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and integrations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Device Sync */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Smartphone className="h-5 w-5 text-primary" /> Calendar Integration</h3>
            <p className="card-description">Sync your protocol to your iPhone, Android, or PC calendar.</p>
          </div>
          <div className="card-content space-y-4">
            <div className="p-4 bg-background border border-border rounded-md">
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">iCal Subscription URL</label>
              <div className="flex gap-2">
                <input 
                  className="form-input text-xs font-mono" 
                  readOnly 
                  value={calendarUrl} 
                />
                <button 
                  onClick={() => { navigator.clipboard.writeText(calendarUrl); alert("URL Copied!"); }}
                  className="btn btn-primary px-3"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste this URL into your calendar app (Apple Calendar, Google Calendar, Outlook) to receive alerts on your devices.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Bell className="h-5 w-5 text-primary" /> Notifications</h3>
            <p className="card-description">Configure your reminder alerts.</p>
          </div>
          <div className="card-content space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-md">
              <div>
                <p className="font-medium">Browser Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts even when the tab is closed.</p>
              </div>
              <button className="btn btn-outline text-xs">Enable</button>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-md">
              <div>
                <p className="font-medium">Inventory Alerts</p>
                <p className="text-xs text-muted-foreground">Notify me when a vial is below 10%.</p>
              </div>
              <button className="btn btn-outline text-xs">Configure</button>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Shield className="h-5 w-5 text-primary" /> Security</h3>
            <p className="card-description">Account and data privacy settings.</p>
          </div>
          <div className="card-content space-y-4">
            <p className="text-sm">User: <span className="font-mono text-primary">{user.email}</span></p>
            <p className="text-xs text-muted-foreground">Your session is secured using clinical-grade RLS protocols.</p>
            <button className="btn btn-outline w-full text-destructive hover:bg-destructive/10">Delete All Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
