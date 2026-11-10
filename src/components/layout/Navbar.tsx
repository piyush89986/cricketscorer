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
  Activity,
  PlusCircle,
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-blue-900">
                Cric<span className="text-blue-600">Score</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 rounded">
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-600 border border-red-200 animate-pulse">
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
                <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-blue-600 capitalize font-semibold">{user.role.replace("_", " ")}</p>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 rounded-xl">
                  Signed in as <span className="font-bold text-slate-900">{user.name}</span> ({user.role})
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20"
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
