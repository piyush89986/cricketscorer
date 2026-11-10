"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react";

export default function NewMatchPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    tournamentId: "",
    teamAId: "",
    teamBId: "",
    stage: "League Match",
    venue: "Main Cricket Ground",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    overs: 20,
    assignedUmpire: "Official Umpire",
  });

  useEffect(() => {
    async function loadResources() {
      try {
        const [tournamentsRes, teamsRes] = await Promise.all([
          fetch("/api/tournaments"),
          fetch("/api/teams"),
        ]);
        const tData = await tournamentsRes.json();
        const teamsData = await teamsRes.json();

        setTournaments(tData.tournaments || []);
        setTeams(teamsData.teams || []);

        if (tData.tournaments?.length) {
          setForm((f) => ({ ...f, tournamentId: tData.tournaments[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.teamAId === form.teamBId) {
      setError("Team A and Team B cannot be the same.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule match");

      router.push(`/scorer/${data.match._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard/matches" className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Schedule Single Match</h1>
          <p className="text-xs text-slate-500">Configure competing teams, venue, and overs</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Select Tournament *
          </label>
          <select
            required
            value={form.tournamentId}
            onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="">-- Choose tournament --</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.format})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Team A *
            </label>
            <select
              required
              value={form.teamAId}
              onChange={(e) => setForm({ ...form, teamAId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="">-- Select Team A --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Team B *
            </label>
            <select
              required
              value={form.teamBId}
              onChange={(e) => setForm({ ...form, teamBId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="">-- Select Team B --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Venue / Ground
            </label>
            <input
              type="text"
              required
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Time
            </label>
            <input
              type="text"
              placeholder="10:00 AM"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Number of Overs
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.overs}
              onChange={(e) => setForm({ ...form, overs: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Stage / Round Title
            </label>
            <input
              type="text"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              placeholder="e.g. League Match 3, Quarter Final"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.tournamentId || !form.teamAId || !form.teamBId}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
        >
          {loading ? "Scheduling..." : "Schedule Match & Open Scorer Desk"}
        </button>
      </form>
    </div>
  );
}
