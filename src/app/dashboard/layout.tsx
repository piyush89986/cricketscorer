"use client";

import React, { useState } from "react";
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
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
    { href: "/dashboard/teams", label: "Teams", icon: Users },
    { href: "/dashboard/players", label: "Players", icon: UserCheck },
    { href: "/dashboard/matches", label: "Matches & Fixtures", icon: Calendar },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Dashboard Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs">
            Hub
          </span>
          <span className="font-bold text-slate-800 text-sm">Organizer Console</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-md">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0 shadow-sm">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
            Tournament Management Hub
          </p>
          <h2 className="text-lg font-black text-slate-900">Organizer Console</h2>
        </div>

        <nav className="space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm"
                    : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-200 px-2 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
            Live Scoring & TV
          </p>
          <Link
            href="/scorer"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Open Scorer Console</span>
          </Link>
          <Link
            href="/live"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <Tv className="w-4 h-4 text-slate-600" />
            <span>Public Live Center</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
        {children}
      </main>
    </div>
  );
}
