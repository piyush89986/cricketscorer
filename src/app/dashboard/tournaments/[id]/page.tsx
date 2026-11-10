"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Calendar,
  MapPin,
  Layers,
  Users,
  PlayCircle,
  PlusCircle,
  RefreshCw,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "generate">("standings");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [tRes, teamsRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch("/api/teams"),
      ]);
      const tData = await tRes.json();
      const teamsData = await teamsRes.json();

      setData(tData);
      setAllTeams(teamsData.teams || []);
      if (teamsData.teams?.length) {
        setSelectedTeams(teamsData.teams.map((t: any) => t._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerateFixtures = async () => {
    if (selectedTeams.length < 2) {
      alert("Please select at least 2 teams to generate fixtures.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const res = await fetch(`/api/tournaments/${id}/fixtures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamIds: selectedTeams,
          clearExisting: false,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to generate fixtures");

      setMessage(resData.message);
      await loadData();
      setActiveTab("fixtures");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading tournament details...</div>;
  }

  const { tournament, matches = [], standings = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Tournament Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {tournament.status}
              </span>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {tournament.format.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{tournament.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">{tournament.description || "Cricket Championship"}</p>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab("generate")}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Fixtures</span>
            </button>
          </div>
        </div>

        {/* Tournament meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue</span>
            <span className="font-bold text-slate-800">{tournament.venue}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
            <span className="font-bold text-slate-800">
              {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Overs & Ball</span>
            <span className="font-bold text-slate-800">{tournament.overs} Overs • {tournament.ballType.replace("_", " ")}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Points Rule</span>
            <span className="font-bold text-blue-700">
              Win: {tournament.rules?.pointsWin} | Tie: {tournament.rules?.pointsTie} | Loss: {tournament.rules?.pointsLoss}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - responsive scroll */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("standings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "standings"
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Points Table (Standings)
        </button>
        <button
          onClick={() => setActiveTab("fixtures")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "fixtures"
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Fixtures & Results ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "generate"
              ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Auto Fixture Wizard
        </button>
      </div>

      {/* Tab 1: Points Table */}
      {activeTab === "standings" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span>Official Tournament Standings & Net Run Rate (NRR)</span>
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              ICC Standard NRR Applied
            </span>
          </div>

          {standings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No standings yet. Generate fixtures and register teams to initialize points table.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank & Team</th>
                    <th className="py-3 px-3 text-center">P</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">T</th>
                    <th className="py-3 px-3 text-center">NR</th>
                    <th className="py-3 px-3 text-center font-bold text-blue-700">PTS</th>
                    <th className="py-3 px-4 text-right">NRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {standings.map((s: any, idx: number) => (
                    <tr
                      key={s._id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        idx < 2 ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {s.team?.shortName?.substring(0, 2) || "T"}
                        </div>
                        <span className="font-bold text-slate-900">{s.team?.name}</span>
                        {idx < 2 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                            Q
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{s.played}</td>
                      <td className="py-3 px-3 text-center text-blue-700 font-bold">{s.won}</td>
                      <td className="py-3 px-3 text-center text-red-600">{s.lost}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{s.tied}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{s.noResult}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-sm text-blue-700">
                        {s.points}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={s.netRunRate >= 0 ? "text-blue-700" : "text-red-600"}>
                          {s.netRunRate > 0 ? `+${s.netRunRate.toFixed(3)}` : s.netRunRate.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fixtures & Results */}
      {activeTab === "fixtures" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No fixtures generated yet.</p>
              <button
                onClick={() => setActiveTab("generate")}
                className="mt-3 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Auto Generate Fixtures Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m: any) => (
                <div
                  key={m._id}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-blue-700">Match #{m.matchNumber} • {m.stage}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === "live"
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
                      <span>📅 {new Date(m.date).toLocaleDateString()} at {m.time} • {m.venue}</span>
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Fixture Generator Wizard */}
      {activeTab === "generate" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Automated Cricket Fixture Generator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select participating teams. CricScore will automatically calculate mathematical pairings according to tournament rules ({tournament.format}).
            </p>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Participating Teams ({selectedTeams.length} selected):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allTeams.map((team) => {
                const isSelected = selectedTeams.includes(team._id);
                return (
                  <button
                    key={team._id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTeams(selectedTeams.filter((id) => id !== team._id));
                      } else {
                        setSelectedTeams([...selectedTeams, team._id]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900">{team.name}</p>
                      <p className="text-[10px] text-slate-500">{team.city || "Club Team"}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600">{team.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleGenerateFixtures}
              disabled={generating || selectedTeams.length < 2}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider"
            >
              {generating ? "Generating Fixtures..." : `Generate ${tournament.format.replace("_", " ")} Schedule`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
