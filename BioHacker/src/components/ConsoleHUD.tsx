"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, Settings, LogOut, ShieldCheck, Activity } from "lucide-react";

export function ConsoleHUD({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/dashboard#inventory", icon: Beaker },
    { name: "Punt", href: "/dashboard#scheduler", icon: Calendar },
    { name: "History", href: "/dashboard/history", icon: Activity },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="diag-hud !px-6 !py-3">
      {/* HUD Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[14px] shadow-sm group-hover:rotate-12 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-[var(--foreground)]">BioHacker</h1>
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-0.5">Vanguard Edition</p>
          </div>
        </Link>
      </div>

      {/* HUD Center: Nav Links */}
      <nav className="flex items-center bg-[var(--muted)] p-1.5 rounded-[20px] shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-[16px] transition-all
                ${isActive
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[12px] font-bold whitespace-nowrap hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* HUD Right: Logout */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors font-bold text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
