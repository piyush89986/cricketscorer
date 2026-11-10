"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  Tv,
  Activity,
  PlusCircle,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/dashboard/teams", label: "Teams", icon: Users },
    { href: "/dashboard/players", label: "Players", icon: UserCheck },
    { href: "/dashboard/matches", label: "Matches & Fixtures", icon: Calendar },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#080d1a]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0b1120] border-r border-slate-800 p-4 shrink-0">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Tournament Management Hub
          </p>
          <h2 className="text-lg font-black text-white">Organizer Console</h2>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800/80 px-2 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
            Live Scoring & TV
          </p>
          <Link
            href="/scorer"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Open Scorer Console</span>
          </Link>
          <Link
            href="/live"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>Public Live Center</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

