"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Radio,
  Tv,
  Activity,
  ArrowRight,
  Shield,
  Zap,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Users,
} from "lucide-react";
import { formatOvers } from "@/lib/utils";

export default function HomePage() {
  const [liveMatch, setLiveMatch] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    async function fetchLiveMatch() {
      try {
        const res = await fetch("/api/matches?limit=1");
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setLiveMatch(data.matches[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLiveMatch();
  }, [seeded]);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setSeeded(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-5 sm:space-y-6 pt-4 sm:pt-8 pb-2 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>Next-Gen Cricket Management & Live Broadcast Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Eliminate Manual Paper. <br />
          Score & Broadcast <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Every Ball Live</span>.
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
          From local gully tournaments and club leagues to academies and school championships. Manage squads, automate fixtures, record ball-by-ball deliveries, and broadcast live stadium scoreboards.
        </p>

        {/* Action Buttons - Fully Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3 px-4 sm:px-0">
          <Link
            href="/live"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all text-sm flex items-center justify-center space-x-2"
          >
            <Radio className="w-4 h-4 text-white" />
            <span>Watch Live Matches</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all text-sm flex items-center justify-center space-x-2"
          >
            <Trophy className="w-4 h-4 text-blue-600" />
            <span>Tournament Dashboard</span>
          </Link>

          <Link
            href="/scorer"
            className="w-full sm:w-auto px-5 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 transition-all text-sm flex items-center justify-center space-x-2"
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Scorer Console</span>
          </Link>
        </div>
      </section>

      {/* Featured Live Match Spotlight */}
      {liveMatch && (
        <section className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-5 sm:p-8 shadow-xl shadow-blue-600/5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="font-extrabold text-red-600 uppercase tracking-wider">
                  FEATURED MATCH IN PROGRESS
                </span>
              </div>
              <span className="text-slate-500 font-bold">{liveMatch.tournament?.name}</span>
            </div>

            {/* Teams score row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100 my-2">
              <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">
                    {liveMatch.teamA?.shortName || "TA"}
                  </div>
                  <div>
                    <span className="font-bold text-sm sm:text-base text-slate-900 block">{liveMatch.teamA?.name}</span>
                    <span className="text-[11px] text-slate-500">First Innings</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-lg sm:text-xl text-slate-900 block">
                    {liveMatch.summary?.teamAScore?.runs ?? 0}/{liveMatch.summary?.teamAScore?.wickets ?? 0}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {formatOvers(liveMatch.summary?.teamAScore?.legalBalls ?? 0)} ov
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center font-bold text-sm text-white shadow-sm">
                    {liveMatch.teamB?.shortName || "TB"}
                  </div>
                  <div>
                    <span className="font-bold text-sm sm:text-base text-slate-900 block">{liveMatch.teamB?.name}</span>
                    <span className="text-[11px] text-blue-600 font-bold">Batting Now</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-lg sm:text-xl text-blue-700 block">
                    {liveMatch.summary?.teamBScore?.runs ?? 0}/{liveMatch.summary?.teamBScore?.wickets ?? 0}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {formatOvers(liveMatch.summary?.teamBScore?.legalBalls ?? 0)} ov
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                📍 {liveMatch.venue} • {liveMatch.overs} Overs Match
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/live/${liveMatch._id}`}
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Open Scorecard
                </Link>
                <Link
                  href={`/display/${liveMatch._id}`}
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <Tv className="w-3.5 h-3.5 text-blue-600" />
                  <span>TV Scoreboard</span>
                </Link>
                <Link
                  href={`/scorer/${liveMatch._id}`}
                  className="w-full sm:w-auto text-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-all"
                >
                  Score Match
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillar Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Ball-by-Ball Scoring Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fast, touch-optimized mobile & tablet keypad. Authoritative server calculations for legal deliveries, wides, no-balls, wickets, and strike rotation.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <Tv className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Stadium TV Broadcast Mode</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            High-contrast stadium layout built for 55"+ LED screens and projectors. Auto-cycles between live scoreboard, batting, and bowling cards.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Net Run Rate & Leaderboards</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ICC-compliant NRR calculation with all-out adjustments. Automated points table sorting, Orange Cap and Purple Cap leaderboards.
          </p>
        </div>
      </section>

      {/* Quick Demo Data Initializer Box */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl shadow-blue-600/10">
        <div>
          <h3 className="text-lg sm:text-xl font-bold flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Instant Tournament Sandbox</span>
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Want to test immediately? Load the Premier T20 Champions League with 4 city teams, 22 real players, and an active live match in progress.
          </p>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-blue-700 font-extrabold rounded-2xl text-xs uppercase tracking-wider shrink-0 transition-all shadow-md"
        >
          {seeding ? "Seeding Tournament..." : seeded ? "✅ Reload Fresh Sample" : "Load Sample Tournament"}
        </button>
      </section>
    </div>
  );
}
