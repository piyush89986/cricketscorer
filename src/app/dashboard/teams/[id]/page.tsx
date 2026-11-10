"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  PlusCircle,
  Shield,
  Trash2,
  Crown,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function TeamDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [isWicketKeeper, setIsWicketKeeper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadTeamData = async () => {
    try {
      const [teamRes, playersRes] = await Promise.all([
        fetch(`/api/teams/${id}`),
        fetch("/api/players"),
      ]);
      const teamData = await teamRes.json();
      const playersData = await playersRes.json();

      setData(teamData);
      setAvailablePlayers(playersData.players || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/teams/${id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          jerseyNumber: jerseyNumber ? Number(jerseyNumber) : 0,
          isCaptain,
          isWicketKeeper,
        }),
      });

      if (res.ok) {
        setSelectedPlayerId("");
        setJerseyNumber("");
        setIsCaptain(false);
        setIsWicketKeeper(false);
        await loadTeamData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm("Remove player from team squad?")) return;
    try {
      await fetch(`/api/teams/${id}/players?playerId=${playerId}`, { method: "DELETE" });
      await loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading squad...</div>;

  const { team, squad = [], matches = [] } = data || {};

  if (!team) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Team Not Found</h2>
        <p className="text-xs text-slate-500">
          {data?.error || "We couldn't locate this team profile. It may have been deleted or the link is incorrect."}
        </p>
        <Link
          href="/dashboard/teams"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teams</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard/teams" className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{team?.name} Squad</h1>
          <p className="text-xs text-slate-500">{team?.city || "Club Franchise"} • Short Code: {team?.shortName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Active Squad Members ({squad.length})</span>
              </h3>
            </div>

            {squad.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No players added to squad yet. Add players using the form on the right.
              </p>
            ) : (
              <div className="space-y-2">
                {squad.filter(Boolean).map((player: any) => {
                  const playerId = player?._id?.toString() || player?.toString();
                  const capId = team?.captain?._id?.toString() || team?.captain?.toString();
                  const wkId = team?.wicketkeeper?._id?.toString() || team?.wicketkeeper?.toString();
                  const isCap = capId && capId === playerId;
                  const isWK = wkId && wkId === playerId;
                  return (
                    <div
                      key={playerId || Math.random().toString()}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center">
                          #{player?.jerseyNumber || 0}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{player?.name || "Player"}</span>
                            {isCap && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px]">
                                C
                              </span>
                            )}
                            {isWK && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-300 font-bold text-[10px]">
                                WK
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 capitalize">
                            {(player?.role || "Player").replace("_", " ")} • {(player?.battingStyle || "Right Hand").replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemovePlayer(player?._id || playerId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove from squad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add player to squad panel */}
        <div className="space-y-4">
          <form onSubmit={handleAddPlayer} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Add Player to Squad</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Player Profile
              </label>
              <select
                required
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="">-- Choose registered player --</option>
                {availablePlayers.filter(Boolean).map((p) => (
                  <option key={p._id || Math.random().toString()} value={p._id}>
                    {p?.name || "Player"} ({p?.role ? p.role.replace("_", " ") : "All Rounder"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Jersey Number
              </label>
              <input
                type="number"
                min={0}
                max={999}
                placeholder="e.g. 18"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCaptain}
                  onChange={(e) => setIsCaptain(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Assign as Team Captain (C)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWicketKeeper}
                  onChange={(e) => setIsWicketKeeper(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Assign as Wicketkeeper (WK)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={adding || !selectedPlayerId}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
            >
              {adding ? "Adding..." : "Add to Team Squad"}
            </button>
          </form>

          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-center">
            <p className="text-xs text-slate-600 font-medium">Need a player profile that doesn't exist?</p>
            <Link
              href="/dashboard/players/new"
              className="inline-block mt-2 text-xs font-bold text-blue-700 hover:underline"
            >
              + Create Reusable Player Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
