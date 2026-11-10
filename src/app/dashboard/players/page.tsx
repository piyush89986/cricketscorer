"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, PlusCircle, Search, Filter, ArrowRight } from "lucide-react";

export default function PlayersListPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    try {
      let url = "/api/players?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter) url += `role=${encodeURIComponent(roleFilter)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Player Registry</h1>
          <p className="text-sm text-slate-400 mt-1">Reusable player profiles, bowling/batting roles, and statistics</p>
        </div>
        <Link
          href="/dashboard/players/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Player</span>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0d1424] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#0d1424] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Roles</option>
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all_rounder">All-Rounder</option>
          <option value="wicket_keeper">Wicketkeeper</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading players...</div>
      ) : players.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1424] border border-slate-800 rounded-2xl">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No players found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <div
              key={p._id}
              className="bg-[#0d1424] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {p.role.replace("_", " ")} • #{p.jerseyNumber || 0}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-3 border-t border-slate-800 text-slate-400">
                <p>Batting: <span className="text-slate-200 capitalize font-medium">{p.battingStyle.replace("_", " ")}</span></p>
                <p>Bowling: <span className="text-slate-200 capitalize font-medium">{p.bowlingStyle.replace("_", " ")}</span></p>
                {p.currentTeam && (
                  <p>Club: <span className="text-emerald-400 font-semibold">{p.currentTeam.name}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
