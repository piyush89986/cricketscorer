"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Radio, ArrowRight, Trophy, Calendar } from "lucide-react";

export default function ScorerDeskListPage() {
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
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Official Scorer Console</h1>
          <p className="text-xs sm:text-sm text-slate-500">Select an active or upcoming match to begin ball-by-ball scoring</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">No scheduled matches found.</p>
          <Link
            href="/dashboard/matches/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Schedule Match in Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => {
            const isLive = m.status === "live" || m.status === "innings_break";
            return (
              <div
                key={m._id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm ${
                  isLive ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 truncate max-w-[200px]">
                      {m.tournament?.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                          : m.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
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

                  <p className="text-xs text-slate-500 mb-4">
                    📍 {m.venue} • {m.overs} Overs
                  </p>
                </div>

                <Link
                  href={`/scorer/${m._id}`}
                  className={`w-full py-3 rounded-xl text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    isLive
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  <span>{isLive ? "Continue Live Scoring" : "Open Match & Toss"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
