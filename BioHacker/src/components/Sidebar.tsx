"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, Settings, LogOut, ShieldCheck, Menu, X, History } from "lucide-react";
import { useState } from "react";

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Stash", href: "/dashboard#inventory", icon: Beaker },
    { name: "Cycle", href: "/dashboard#scheduler", icon: Calendar },
    { name: "Journal", href: "/dashboard/history", icon: History },
    { name: "More", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl text-[var(--foreground)]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:h-screen flex-shrink-0 flex flex-col
      `}>
        <div className="flex flex-col h-full p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-[var(--foreground)]">BioTracker</h1>
              <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-[0.2em]">Clinical Suite</p>
            </div>
          </div>

          {/* Nav Section */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" 
                        : "text-[var(--muted-foreground)] hover:bg-[var(--input-bg)] hover:text-[var(--foreground)]"}
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--primary)]"}`} />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto pt-8 border-t border-[var(--border)]">
            <button 
              onClick={onSignOut}
              className="flex items-center gap-3.5 px-4 py-3 w-full text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] rounded-xl transition-colors duration-200 group"
            >
              <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
