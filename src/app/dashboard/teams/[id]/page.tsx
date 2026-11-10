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

  if (loading) return <div className="p-12 text-center text-slate-400">Loading squad...</div>;

  const { team, squad = [], matches = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard/teams" className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">{team.name} Squad</h1>
          <p className="text-xs text-slate-400">{team.city || "Club Franchise"} • Short Code: {team.shortName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Active Squad Members ({squad.length})</span>
              </h3>
            </div>

            {squad.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No players added to squad yet. Add players using the form on the right.
              </p>
            ) : (
              <div className="space-y-2">
                {squad.map((player: any) => {
                  const isCap = team.captain?._id === player._id;
                  const isWK = team.wicketkeeper?._id === player._id;
                  return (
                    <div
                      key={player._id}
                      className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-slate-300 flex items-center justify-center">
                          #{player.jerseyNumber || 0}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{player.name}</span>
                            {isCap && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                                C
                              </span>
                            )}
                            {isWK && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[10px]">
                                WK
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {player.role.replace("_", " ")} • {player.battingStyle.replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemovePlayer(player._id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
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
          <form onSubmit={handleAddPlayer} className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Add Player to Squad</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Player Profile
              </label>
              <select
                required
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose registered player --</option>
                {availablePlayers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Jersey Number
              </label>
              <input
                type="number"
                min={0}
                max={999}
                placeholder="e.g. 18"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCaptain}
                  onChange={(e) => setIsCaptain(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Assign as Team Captain (C)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWicketKeeper}
                  onChange={(e) => setIsWicketKeeper(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Assign as Wicketkeeper (WK)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={adding || !selectedPlayerId}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              {adding ? "Adding..." : "Add to Team Squad"}
            </button>
          </form>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <p className="text-xs text-slate-400">Need a player profile that doesn't exist?</p>
            <Link
              href="/dashboard/players/new"
              className="inline-block mt-2 text-xs font-bold text-emerald-400 hover:underline"
            >
              + Create Reusable Player Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

