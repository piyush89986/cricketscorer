"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Tv, Trophy, Calendar, ArrowRight } from "lucide-react";
import { formatOvers } from "@/lib/utils";

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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl animate-pulse shadow-sm">
          <Radio className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Live Match Center</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time cricket scorecards, ball-by-ball broadcast, and stadium TV displays
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading live matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">No active matches found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isLive = m.status === "live" || m.status === "innings_break";
            return (
              <div
                key={m._id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm ${
                  isLive
                    ? "border-blue-400 ring-2 ring-blue-100 hover:shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 truncate max-w-[170px]">
                      {m.tournament?.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isLive
                          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                          : m.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 py-2 border-y border-slate-100 my-2">
                    <div className="flex items-center justify-between text-base font-bold text-slate-900">
                      <span>{m.teamA?.name}</span>
                      <span className="font-mono text-sm text-slate-700">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold text-slate-900">
                      <span>{m.teamB?.name}</span>
                      <span className="font-mono text-sm text-slate-700">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 truncate">
                    {m.result?.summary ? (
                      <span className="text-blue-700 font-bold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/live/${m._id}`}
                    className="py-2.5 px-3 rounded-xl text-center font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/display/${m._id}`}
                    className="py-2.5 px-3 rounded-xl text-center font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Tv className="w-3.5 h-3.5 text-slate-500" />
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
