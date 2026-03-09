"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Beaker, Calendar, BookOpen, MoreHorizontal, Plus, Eye, Package, Syringe, Heart, X, LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

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
    name: "Stash",
    icon: Beaker,
    href: "/dashboard?tab=inventory",
    tabMatch: "inventory",
    subs: [
      { label: "View Stash", href: "/dashboard?tab=inventory", icon: Eye },
      { label: "Perform Inventory", href: "/dashboard?tab=inventory&action=perform", icon: Package },
      { label: "Add to Stash", href: "/dashboard?tab=inventory&action=add", icon: Plus },
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
      { label: "Theme", href: "#theme", icon: Sun },
      { label: "Logout", href: "#logout", icon: LogOut },
    ] as SubItem[],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "dash";
  const [openSub, setOpenSub] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const saved = localStorage.getItem('biotracker-theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('biotracker-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

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

  const handleSubClick = (sub: SubItem, e: React.MouseEvent) => {
    if (sub.href === '#logout') {
      e.preventDefault();
      handleLogout();
      setOpenSub(null);
    } else if (sub.href === '#theme') {
      e.preventDefault();
      toggleTheme();
    } else {
      setOpenSub(null);
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
            className="fixed bottom-[80px] left-4 right-4 z-[99] rounded-3xl overflow-hidden shadow-2xl animate-softFadeIn"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Tray header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] opacity-60">
                {NAV_ITEMS.find(i => i.id === openSub)?.name} Sequence
              </span>
              <button onClick={() => setOpenSub(null)} className="p-2 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Sub items */}
            <div className="grid grid-cols-2 gap-3 p-4">
              {NAV_ITEMS.find(i => i.id === openSub)?.subs.map(sub => {
                const Icon = sub.href === '#theme' ? (theme === 'dark' ? Moon : Sun) : sub.icon;
                const isSelected = sub.href === '#theme' ? false : pathname === sub.href;
                return (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    onClick={(e) => handleSubClick(sub, e)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--muted)]/50 border border-transparent hover:border-[var(--primary)]/20 hover:bg-[var(--card)] transition-all group"
                  >
                    <div className="p-2.5 rounded-xl bg-[var(--card)] shadow-sm group-hover:bg-[var(--primary-muted)] transition-colors">
                      <Icon className={`h-5 w-5 ${sub.href === '#logout' ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'}`} />
                    </div>
                    <span className="text-xs font-bold text-[var(--foreground)]">{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-xl border-t border-[var(--border)] flex justify-around items-center pb-safe-bottom shadow-lg"
        style={{ background: 'var(--glass-bg)', minHeight: '72px' }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const subOpen = openSub === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavTap(item)}
              className="flex flex-col items-center justify-center gap-1.5 flex-1 transition-all relative"
              style={{
                minHeight: '72px',
                background: 'none',
                border: 'none',
                color: active || subOpen ? 'var(--primary)' : 'var(--muted-foreground)',
                cursor: 'pointer',
                transform: active || subOpen ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className={`
                p-2 rounded-xl transition-colors
                ${active || subOpen ? 'bg-[var(--primary-muted)]' : 'bg-transparent'}
              `}>
                <Icon
                  style={{
                    width: '1.4rem',
                    height: '1.4rem',
                  }}
                />
                {item.subs.length > 0 && (
                  <div className={`
                    absolute top-2 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full
                    ${subOpen ? 'bg-[var(--primary)]' : 'bg-[var(--muted-foreground)] opacity-30'}
                  `} />
                )}
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                opacity: active || subOpen ? 1 : 0.6
              }}>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
