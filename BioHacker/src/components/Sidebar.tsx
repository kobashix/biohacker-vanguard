"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, Settings, LogOut, ShieldCheck, Menu, X, History } from "lucide-react";
import { useState } from "react";

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/dashboard/inventory", icon: Beaker },
    { name: "Protocol Scheduler", href: "/dashboard/scheduler", icon: Calendar },
    { name: "Clinical History", href: "/dashboard/history", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2.5 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl text-[#fafafa]"
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
        fixed inset-y-0 left-0 z-50 w-72 bg-[#18181b] transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:h-screen flex-shrink-0 flex flex-col
      `}>
        <div className="flex flex-col h-full p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="p-2 bg-[#2563eb]/10 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-[#2563eb]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-[#fafafa]">BioHacker</h1>
              <p className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-[0.2em]">Clinical Suite</p>
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
                      ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20" 
                      : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]"}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "group-hover:text-[#2563eb]"}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto pt-8 border-t border-[#27272a]">
            <button 
              onClick={onSignOut}
              className="flex items-center gap-3.5 px-4 py-3 w-full text-[#a1a1aa] hover:bg-[#ef4444]/10 hover:text-[#ef4444] rounded-xl transition-colors duration-200 group"
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
