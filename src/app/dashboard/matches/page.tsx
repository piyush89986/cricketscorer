"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, PlusCircle, Radio, Tv, Activity, Trophy, Clock, ArrowRight } from "lucide-react";

export default function MatchesListPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      let url = "/api/matches?";
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await fetch(url);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Matches & Fixtures</h1>
          <p className="text-sm text-slate-400 mt-1">Schedule matches, assign scorers, and launch live scoring</p>
        </div>
        <Link
          href="/dashboard/matches/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Single Match</span>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: "", label: "All Matches" },
          { id: "live", label: "Live Now 🔴" },
          { id: "upcoming", label: "Upcoming" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === tab.id
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1424] border border-slate-800 rounded-2xl">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Matches Found</h3>
          <p className="text-sm text-slate-400 mt-1">Schedule a match or generate tournament fixtures.</p>
          <Link
            href="/dashboard/matches/new"
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Match</span>
          </Link>
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
                    ? "border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-slate-400 truncate max-w-[160px]">
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

                  {/* Teams info */}
                  <div className="space-y-2 py-2 border-y border-slate-800/80 my-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{m.teamA?.name}</span>
                      <span className="font-mono font-bold text-slate-300">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{m.teamB?.name}</span>
                      <span className="font-mono font-bold text-slate-300">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-3">
                    {m.result?.summary ? (
                      <span className="text-emerald-400 font-semibold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
                  <Link
                    href={`/scorer/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Scorer</span>
                  </Link>
                  <Link
                    href={`/live/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Live</span>
                  </Link>
                  <Link
                    href={`/display/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors flex items-center justify-center space-x-1"
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

