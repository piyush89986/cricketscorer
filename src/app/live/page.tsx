"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Tv, Trophy, Calendar, ArrowRight } from "lucide-react";

export default function PublicLiveMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl animate-pulse">
          <Radio className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Live Match Center</h1>
          <p className="text-sm text-slate-400">
            Real-time cricket scorecards, ball-by-ball broadcast, and stadium TV displays
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading live matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1424] border border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-400">No active matches found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isLive = m.status === "live" || m.status === "innings_break";
            return (
              <div
                key={m._id}
                className={`bg-[#0d1424] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isLive
                    ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-slate-400 truncate max-w-[170px]">
                      {m.tournament?.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                          : m.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 py-2 border-y border-slate-800 my-2">
                    <div className="flex items-center justify-between text-base font-bold text-white">
                      <span>{m.teamA?.name}</span>
                      <span className="font-mono text-sm text-slate-300">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold text-white">
                      <span>{m.teamB?.name}</span>
                      <span className="font-mono text-sm text-slate-300">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 truncate">
                    {m.result?.summary ? (
                      <span className="text-emerald-400 font-semibold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <Link
                    href={`/live/${m._id}`}
                    className="py-2.5 px-3 rounded-xl text-center font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/display/${m._id}`}
                    className="py-2.5 px-3 rounded-xl text-center font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Mode</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
