"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, BookOpen, MoreHorizontal, Plus, Eye, Package, Syringe, Heart, X } from "lucide-react";
import { useState } from "react";

type SubItem = { label: string; href: string; icon: any };

const NAV_ITEMS = [
  {
    id: "home",
    name: "Home",
    icon: LayoutDashboard,
    href: "/dashboard?tab=dash",
    tabMatch: "dash",
    subs: [] as SubItem[],
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: Beaker,
    href: "/dashboard?tab=inventory",
    tabMatch: "inventory",
    subs: [
      { label: "View Inventory", href: "/dashboard?tab=inventory", icon: Eye },
      { label: "Perform Inventory", href: "/dashboard?tab=inventory&action=perform", icon: Package },
      { label: "Modify Inventory", href: "/dashboard?tab=inventory&action=add", icon: Plus },
    ] as SubItem[],
  },
  {
    id: "cycle",
    name: "Cycle",
    icon: Calendar,
    href: "/dashboard?tab=plan",
    tabMatch: "plan",
    subs: [] as SubItem[],
  },
  {
    id: "journal",
    name: "Journal",
    icon: BookOpen,
    href: "/dashboard/history",
    tabMatch: null,
    subs: [
      { label: "Dose Pins", href: "/dashboard/history?view=doses", icon: Syringe },
      { label: "Wellbeing Journal", href: "/dashboard/history?view=wellbeing", icon: Heart },
    ] as SubItem[],
  },
  {
    id: "more",
    name: "More",
    icon: MoreHorizontal,
    href: "/dashboard/settings",
    tabMatch: null,
    subs: [
      { label: "Settings & Setup", href: "/dashboard/settings", icon: MoreHorizontal },
      { label: "Knowledge Base", href: "/dashboard?tab=kb", icon: BookOpen },
    ] as SubItem[],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "dash";
  const [openSub, setOpenSub] = useState<string | null>(null);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.tabMatch) {
      return pathname === "/dashboard" && currentTab === item.tabMatch;
    }
    return pathname.startsWith(item.href.split("?")[0]) && item.id !== "home";
  };

  const handleNavTap = (item: typeof NAV_ITEMS[0]) => {
    if (item.subs.length > 0) {
      // Toggle sub-menu
      setOpenSub(prev => prev === item.id ? null : item.id);
    } else {
      setOpenSub(null);
      router.push(item.href);
    }
  };

  return (
    <>
      {/* Sub-menu tray */}
      {openSub && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[98]"
            onClick={() => setOpenSub(null)}
          />
          {/* Tray */}
          <div
            className="fixed bottom-[65px] left-0 right-0 z-[99] mx-3 mb-2 rounded-2xl overflow-hidden"
            style={{ background: '#18181b', border: '1px solid #27272a', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}
          >
            {/* Tray header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem 0.5rem', borderBottom: '1px solid #27272a' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa' }}>
                {NAV_ITEMS.find(i => i.id === openSub)?.name}
              </span>
              <button onClick={() => setOpenSub(null)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.25rem' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Sub items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.75rem' }}>
              {NAV_ITEMS.find(i => i.id === openSub)?.subs.map(sub => {
                const Icon = sub.icon;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setOpenSub(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.875rem 0.5rem',
                      borderRadius: '0.875rem',
                      background: '#09090b',
                      border: '1px solid #27272a',
                      color: '#fafafa',
                      textDecoration: 'none',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md border-t border-[#27272a] flex justify-around items-center pb-safe-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgba(9,9,11,0.97)', minHeight: '64px' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const subOpen = openSub === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavTap(item)}
              className="flex flex-col items-center justify-center gap-1 flex-1 transition-all"
              style={{
                minHeight: '64px',
                background: 'none',
                border: 'none',
                color: subOpen ? '#2563eb' : active ? '#2563eb' : '#71717a',
                cursor: 'pointer',
                transform: active || subOpen ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    fill: active || subOpen ? 'rgba(37,99,235,0.15)' : 'none',
                  }}
                />
                {item.subs.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-5px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: subOpen ? '#2563eb' : '#3f3f46',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: active || subOpen ? 800 : 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
