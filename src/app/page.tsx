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
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 pb-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Next-Gen Cricket Management & Live Broadcast Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Eliminate Paper. <br />
          Score & Broadcast <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 bg-clip-text text-transparent">Every Ball Live</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From gully tournaments and club leagues to school cups. Manage squads, schedule fixtures, record ball-by-ball runs, and synchronize real-time TV scoreboards.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/live"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-xl shadow-emerald-500/25 transition-all text-sm flex items-center space-x-2"
          >
            <Radio className="w-4 h-4" />
            <span>Watch Live Matches</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all text-sm flex items-center space-x-2"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Tournament Dashboard</span>
          </Link>

          <Link
            href="/scorer"
            className="px-5 py-3.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-bold rounded-2xl border border-amber-500/30 transition-all text-sm flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Scorer Console</span>
          </Link>
        </div>
      </section>

      {/* Featured Live Match Spotlight */}
      {liveMatch && (
        <section className="max-w-4xl mx-auto">
          <div className="bg-[#0b1222] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-400 uppercase tracking-wider">
                  FEATURED MATCH IN PROGRESS
                </span>
              </div>
              <span className="text-slate-400 font-semibold">{liveMatch.tournament?.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-slate-800 my-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                    {liveMatch.teamA?.shortName || "TA"}
                  </div>
                  <span className="font-bold text-base text-white">{liveMatch.teamA?.name}</span>
                </div>
                <span className="font-mono font-bold text-lg text-slate-200">
                  {liveMatch.summary?.teamAScore?.runs ?? 0}/{liveMatch.summary?.teamAScore?.wickets ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white">
                    {liveMatch.teamB?.shortName || "TB"}
                  </div>
                  <span className="font-bold text-base text-white">{liveMatch.teamB?.name}</span>
                </div>
                <span className="font-mono font-bold text-lg text-slate-200">
                  {liveMatch.summary?.teamBScore?.runs ?? 0}/{liveMatch.summary?.teamBScore?.wickets ?? 0}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                📍 {liveMatch.venue} • {liveMatch.overs} Overs Match
              </p>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/live/${liveMatch._id}`}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Open Scorecard
                </Link>
                <Link
                  href={`/display/${liveMatch._id}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center space-x-1"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>TV Scoreboard</span>
                </Link>
                <Link
                  href={`/scorer/${liveMatch._id}`}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-semibold text-xs rounded-xl transition-all"
                >
                  Score This Match
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillar Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Ball-by-Ball Scoring Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fast, touch-optimized mobile & tablet keypad. Authoritative server calculations for legal deliveries, wides, no-balls, wickets, and strike rotation.
          </p>
        </div>

        <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Tv className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Stadium TV Broadcast Mode</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-contrast dark stadium layout built for 55"+ LED screens and projectors. Auto-cycles between live scoreboard, batting, and bowling cards.
          </p>
        </div>

        <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Net Run Rate & Leaderboards</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            ICC-compliant NRR calculation with all-out adjustments. Automated points table sorting, Orange Cap and Purple Cap leaderboards.
          </p>
        </div>
      </section>

      {/* Quick Demo Data Initializer Box */}
      <section className="bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Instant Tournament Sandbox</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Want to test immediately? Load the Premier T20 Champions League with 4 city teams, 22 real players, and an active live match in progress.
          </p>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-emerald-500/20"
        >
          {seeding ? "Seeding Tournament..." : seeded ? "✅ Reload Fresh Sample" : "Load Sample Tournament"}
        </button>
      </section>
    </div>
  );
}

