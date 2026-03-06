"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, Settings, History } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vials", href: "/dashboard/inventory", icon: Beaker },
    { name: "Plan", href: "/dashboard/scheduler", icon: Calendar },
    { name: "Logs", href: "/dashboard/history", icon: History },
    { name: "Set", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around items-center p-2 pb-safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-tighter font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
