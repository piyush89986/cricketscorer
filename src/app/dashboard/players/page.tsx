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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Player Registry</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Reusable player profiles, bowling/batting roles, and statistics</p>
        </div>
        <Link
          href="/dashboard/players/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all self-stretch sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Player</span>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-blue-600 shadow-sm font-medium"
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
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No players found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {p.role.replace("_", " ")} • #{p.jerseyNumber || 0}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-3 border-t border-slate-100 text-slate-600">
                <p>Batting: <span className="text-slate-900 capitalize font-medium">{p.battingStyle.replace("_", " ")}</span></p>
                <p>Bowling: <span className="text-slate-900 capitalize font-medium">{p.bowlingStyle.replace("_", " ")}</span></p>
                {p.currentTeam && (
                  <p>Club: <span className="text-blue-700 font-bold">{p.currentTeam.name}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
