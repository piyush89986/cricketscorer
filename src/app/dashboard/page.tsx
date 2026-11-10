"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Radio,
  Flame,
  PlusCircle,
  Tv,
  ArrowRight,
  TrendingUp,
  Award,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatOvers } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, matchesRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/matches?limit=10"),
        ]);

        const analyticsData = await analyticsRes.json();
        const matchesData = await matchesRes.json();

        setData(analyticsData);
        setMatches(matchesData.matches || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = data?.metrics || {
    totalTournaments: 0,
    activeTournaments: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    liveMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
    totalRuns: 0,
    totalWickets: 0,
  };

  const chartData = [
    { name: "Live", count: metrics.liveMatches, color: "#ef4444" },
    { name: "Upcoming", count: metrics.upcomingMatches, color: "#2563eb" },
    { name: "Completed", count: metrics.completedMatches, color: "#10b981" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time cricket tournament operations, fixtures, and broadcast telemetry
          </p>
        </div>

        {/* Quick action buttons - responsive */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/tournaments/new"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Tournament</span>
          </Link>
          <Link
            href="/dashboard/matches/new"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Schedule Match</span>
          </Link>
          <Link
            href="/dashboard/teams/new"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-colors"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Add Team</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tournaments</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalTournaments}</span>
            <span className="text-xs font-semibold text-blue-600">({metrics.activeTournaments} Active)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teams & Squads</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalTeams}</span>
            <span className="text-xs font-semibold text-slate-500">Teams / {metrics.totalPlayers} Pl</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live & Total</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalMatches}</span>
            <span className="text-xs font-bold text-red-600 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
              {metrics.liveMatches} LIVE NOW
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Runs & Wickets</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalRuns}</span>
            <span className="text-xs font-semibold text-slate-500">Runs / {metrics.totalWickets} Wkts</span>
          </div>
        </div>
      </div>

      {/* Live / Ongoing Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Active Fixtures & Live Matches</h2>
          </div>
          <Link href="/dashboard/matches" className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No matches found. Generate fixtures or schedule a match.</p>
            <Link
              href="/dashboard/matches/new"
              className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule First Match</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const isLive = m.status === "live" || m.status === "innings_break";
              return (
                <div
                  key={m._id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                    isLive ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-500 truncate max-w-[150px]">
                      {m.tournament?.name || "Tournament Match"}
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

                  {/* Teams and score */}
                  <div className="space-y-2 py-2 border-y border-slate-100 my-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {m.teamA?.shortName?.substring(0, 2) || "TA"}
                        </div>
                        <span className="font-bold text-sm text-slate-900">{m.teamA?.name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-800">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {m.teamB?.shortName?.substring(0, 2) || "TB"}
                        </div>
                        <span className="font-bold text-sm text-slate-900">{m.teamB?.name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-800">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 truncate mb-4">
                    {m.result?.summary ? (
                      <span className="text-blue-700 font-bold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <Link
                      href={`/scorer/${m._id}`}
                      className="px-2 py-2 text-center text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors"
                    >
                      Scorer
                    </Link>
                    <Link
                      href={`/live/${m._id}`}
                      className="px-2 py-2 text-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
                    >
                      Scorecard
                    </Link>
                    <Link
                      href={`/display/${m._id}`}
                      className="px-2 py-2 text-center text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <Tv className="w-3 h-3 text-slate-500" />
                      <span>TV</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics & Leaderboards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Match distribution chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Match Distribution</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Run Scorers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Run Scorers (Orange Cap)</span>
          </h3>
          <div className="space-y-2.5">
            {data?.leaderboards?.topRunScorers?.length > 0 ? (
              data.leaderboards.topRunScorers.map((batter: any, idx: number) => (
                <div
                  key={batter.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{batter.name}</p>
                      <p className="text-[10px] text-slate-500">SR: {batter.strikeRate} • {batter.sixes} Sixes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-700">{batter.runs}</span>
                    <p className="text-[10px] text-slate-500">{batter.balls}b</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No batting records yet.</p>
            )}
          </div>
        </div>

        {/* Top Wicket Takers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Top Wicket Takers (Purple Cap)</span>
          </h3>
          <div className="space-y-2.5">
            {data?.leaderboards?.topWicketTakers?.length > 0 ? (
              data.leaderboards.topWicketTakers.map((bowler: any, idx: number) => (
                <div
                  key={bowler.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{bowler.name}</p>
                      <p className="text-[10px] text-slate-500">Econ: {bowler.economy} • {bowler.overs} ov</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-700">{bowler.wickets} Wkts</span>
                    <p className="text-[10px] text-slate-500">{bowler.runsConceded} runs</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No bowling records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
