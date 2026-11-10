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
  PieChart,
  Pie,
} from "recharts";

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
    { name: "Upcoming", count: metrics.upcomingMatches, color: "#3b82f6" },
    { name: "Completed", count: metrics.completedMatches, color: "#22c55e" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time cricket tournament operations, fixtures, and broadcast telemetry
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/tournaments/new"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Tournament</span>
          </Link>
          <Link
            href="/dashboard/matches/new"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Schedule Match</span>
          </Link>
          <Link
            href="/dashboard/teams/new"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Add Team</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tournaments</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalTournaments}</span>
            <span className="text-xs font-medium text-emerald-400">({metrics.activeTournaments} Active)</span>
          </div>
        </div>

        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teams & Players</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalTeams}</span>
            <span className="text-xs font-medium text-blue-400">Teams / {metrics.totalPlayers} Players</span>
          </div>
        </div>

        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live & Matches</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalMatches}</span>
            <span className="text-xs font-semibold text-red-400 px-1.5 py-0.5 rounded bg-red-500/20">
              {metrics.liveMatches} LIVE NOW
            </span>
          </div>
        </div>

        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Runs & Wickets</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalRuns}</span>
            <span className="text-xs font-medium text-amber-400">Runs / {metrics.totalWickets} Wkts</span>
          </div>
        </div>
      </div>

      {/* Live / Ongoing Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Fixtures & Live Matches</h2>
          </div>
          <Link href="/dashboard/matches" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1">
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center bg-[#0e1628] border border-slate-800/80 rounded-2xl">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No matches found. Generate fixtures or schedule a new match.</p>
            <Link
              href="/dashboard/matches/new"
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
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
                  className={`bg-[#0d1424] border rounded-2xl p-5 transition-all relative ${
                    isLive
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-slate-400 truncate max-w-[150px]">
                      {m.tournament?.name || "Tournament Match"}
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

                  {/* Teams and score */}
                  <div className="space-y-3 py-2 border-y border-slate-800/60 my-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                          {m.teamA?.shortName?.substring(0, 2) || "TA"}
                        </div>
                        <span className="font-bold text-sm text-slate-100">{m.teamA?.name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-200">
                        {m.summary?.teamAScore?.runs ?? 0}/{m.summary?.teamAScore?.wickets ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                          {m.teamB?.shortName?.substring(0, 2) || "TB"}
                        </div>
                        <span className="font-bold text-sm text-slate-100">{m.teamB?.name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-200">
                        {m.summary?.teamBScore?.runs ?? 0}/{m.summary?.teamBScore?.wickets ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Result summary or venue */}
                  <p className="text-xs text-slate-400 truncate mb-4">
                    {m.result?.summary ? (
                      <span className="text-emerald-400 font-semibold">{m.result.summary}</span>
                    ) : (
                      <span>📍 {m.venue} • {m.overs} Overs</span>
                    )}
                  </p>

                  {/* Action links */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
                    <Link
                      href={`/scorer/${m._id}`}
                      className="px-2 py-1.5 text-center text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors"
                    >
                      Scorer
                    </Link>
                    <Link
                      href={`/live/${m._id}`}
                      className="px-2 py-1.5 text-center text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
                    >
                      Scorecard
                    </Link>
                    <Link
                      href={`/display/${m._id}`}
                      className="px-2 py-1.5 text-center text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <Tv className="w-3 h-3" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match distribution chart */}
        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Match Status Distribution</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
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
        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top Run Scorers (Orange Cap)</span>
          </h3>
          <div className="space-y-3">
            {data?.leaderboards?.topRunScorers?.length > 0 ? (
              data.leaderboards.topRunScorers.map((batter: any, idx: number) => (
                <div
                  key={batter.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{batter.name}</p>
                      <p className="text-[10px] text-slate-400">SR: {batter.strikeRate} • {batter.sixes} Sixes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400">{batter.runs}</span>
                    <p className="text-[10px] text-slate-400">{batter.balls} balls</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No batting records yet.</p>
            )}
          </div>
        </div>

        {/* Top Wicket Takers */}
        <div className="bg-[#0e1628] border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Top Wicket Takers (Purple Cap)</span>
          </h3>
          <div className="space-y-3">
            {data?.leaderboards?.topWicketTakers?.length > 0 ? (
              data.leaderboards.topWicketTakers.map((bowler: any, idx: number) => (
                <div
                  key={bowler.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{bowler.name}</p>
                      <p className="text-[10px] text-slate-400">Econ: {bowler.economy} • {bowler.overs} overs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-purple-400">{bowler.wickets} Wkts</span>
                    <p className="text-[10px] text-slate-400">{bowler.runsConceded} runs</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No bowling records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
