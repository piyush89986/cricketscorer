"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Trophy,
  Radio,
  Tv,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in TV display mode, hide navbar for clean full-screen stadium display
  if (pathname.startsWith("/display/")) {
    return null;
  }

  const navLinks = [
    { href: "/live", label: "Live Matches", icon: Radio, badge: "LIVE" },
    { href: "/tournaments", label: "Tournaments", icon: Trophy },
    ...(user && ["organizer", "super_admin"].includes(user.role)
      ? [{ href: "/dashboard", label: "Organizer Hub", icon: LayoutDashboard }]
      : []),
    ...(user && user.role === "scorer"
      ? [{ href: "/scorer", label: "Scorer Desk", icon: Activity }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b1120]/90 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black text-slate-950">🏏</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                CricScore
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                PRO
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-200 leading-tight truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-emerald-400 capitalize font-medium">{user.role.replace("_", " ")}</p>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg shadow-md shadow-emerald-500/20 transition-all font-sans"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0b1120] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80">
            {user ? (
              <div className="space-y-2">
                <div className="px-3.5 py-2 text-xs text-slate-400">
                  Signed in as <span className="font-semibold text-white">{user.name}</span> ({user.role})
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-slate-800 text-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
