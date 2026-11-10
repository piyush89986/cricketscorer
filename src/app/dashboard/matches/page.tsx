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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Matches & Fixtures</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Schedule matches, assign scorers, and launch live scoring</p>
        </div>
        <Link
          href="/dashboard/matches/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all self-stretch sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Single Match</span>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs">
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
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Matches Found</h3>
          <p className="text-sm text-slate-500 mt-1">Schedule a match or generate tournament fixtures.</p>
          <Link
            href="/dashboard/matches/new"
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
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
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm ${
                  isLive
                    ? "border-blue-400 ring-2 ring-blue-100 hover:shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 truncate max-w-[160px]">
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

                  {/* Teams info */}
                  <div className="space-y-2 py-2 border-y border-slate-100 my-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{m.teamA?.name}</span>
                      <span className="font-mono font-bold text-slate-700">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{m.teamB?.name}</span>
                      <span className="font-mono font-bold text-slate-700">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 truncate mb-3">
                    {m.result?.summary ? (
                      <span className="text-blue-700 font-bold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/scorer/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors flex items-center justify-center space-x-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Scorer</span>
                  </Link>
                  <Link
                    href={`/live/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Live</span>
                  </Link>
                  <Link
                    href={`/display/${m._id}`}
                    className="px-2 py-2 text-center text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors flex items-center justify-center space-x-1"
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
