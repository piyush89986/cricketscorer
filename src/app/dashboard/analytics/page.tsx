"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Award,
  Flame,
  TrendingUp,
  Trophy,
  Activity,
  Layers,
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

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading analytics telemetry...</div>;
  }

  const { metrics, leaderboards } = data || {};

  const summaryBars = [
    { name: "Total Matches", value: metrics?.totalMatches || 0, color: "#2563eb" },
    { name: "Live Matches", value: metrics?.liveMatches || 0, color: "#ef4444" },
    { name: "Completed", value: metrics?.completedMatches || 0, color: "#10b981" },
    { name: "Total Teams", value: metrics?.totalTeams || 0, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tournament Analytics & Leaderboards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verified match records, player statistics, and performance benchmarks
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Runs Scored
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics?.totalRuns || 0}</span>
          <p className="text-xs text-blue-600 font-semibold mt-1">Across all innings</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Wickets
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics?.totalWickets || 0}</span>
          <p className="text-xs text-red-500 font-semibold mt-1">Bowled, caught, run-out</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Average Runs / Match
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics?.averageRunsPerMatch || 0}</span>
          <p className="text-xs text-amber-600 font-semibold mt-1">Scoring tempo</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Highest Innings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics?.highestScore || 0}</span>
          <p className="text-xs text-blue-700 font-semibold mt-1">Tournament record</p>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Competition Activity Overview</span>
        </h3>
        <div className="h-60 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryBars}>
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
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {summaryBars.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Run Scorers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Orange Cap Leaderboard (Top Batsmen)</span>
            </h3>
            <span className="text-xs font-bold text-amber-600">RUNS</span>
          </div>

          <div className="space-y-2.5">
            {leaderboards?.topRunScorers?.map((b: any, idx: number) => (
              <div
                key={b.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{b.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SR: {b.strikeRate} • {b.sixes}x6 {b.fours}x4
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-700 font-mono">{b.runs}</span>
                  <p className="text-[10px] text-slate-500 font-mono">{b.balls} balls</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Wicket Takers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Purple Cap Leaderboard (Top Bowlers)</span>
            </h3>
            <span className="text-xs font-bold text-blue-700">WICKETS</span>
          </div>

          <div className="space-y-2.5">
            {leaderboards?.topWicketTakers?.map((bowler: any, idx: number) => (
              <div
                key={bowler.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{bowler.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Econ: {bowler.economy} • {bowler.overs} ov
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-700 font-mono">{bowler.wickets} Wkts</span>
                  <p className="text-[10px] text-slate-500 font-mono">{bowler.runsConceded} runs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
