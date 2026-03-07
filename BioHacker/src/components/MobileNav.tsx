"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, Settings, History } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dash';

  const navItems = [
    { name: "Dash", href: "/dashboard?tab=dash", icon: LayoutDashboard },
    { name: "Vials", href: "/dashboard?tab=vials", icon: Beaker },
    { name: "Plan", href: "/dashboard?tab=plan", icon: Calendar },
    { name: "Logs", href: "/dashboard/history", icon: History },
    { name: "Set", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around items-center p-1 pb-safe-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        
        let isActive = false;
        if (item.href.includes("?tab=")) {
          isActive = pathname === "/dashboard" && currentTab === item.href.split('=')[1];
        } else {
          isActive = pathname === item.href;
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 min-h-[64px] min-w-[64px] flex-1 transition-all ${
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`h-6 w-6 ${isActive ? 'fill-primary/20' : ''}`} />
            <span className={`text-[11px] uppercase tracking-tighter ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
