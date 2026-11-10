"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    venue: "Main Stadium",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    format: "round_robin",
    overs: 20,
    ballType: "leather",
    maxTeams: 8,
    pointsWin: 2,
    pointsTie: 1,
    pointsLoss: 0,
    pointsNR: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rules: {
            pointsWin: Number(form.pointsWin),
            pointsTie: Number(form.pointsTie),
            pointsLoss: Number(form.pointsLoss),
            pointsNR: Number(form.pointsNR),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tournament");
      }

      router.push(`/dashboard/tournaments/${data.tournament._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/dashboard/tournaments"
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Create New Tournament</h1>
          <p className="text-xs text-slate-400">Configure tournament format, overs, and points scheme</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Tournament Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mumbai Premier Cup 2026"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview or guidelines for participants..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Ground / Venue *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wankhede Stadium, Pitch 2"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Tournament Format
            </label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="round_robin">Round Robin (League Stage)</option>
              <option value="single_elimination">Single Elimination (Knockout)</option>
              <option value="group_knockout">Group Stage followed by Knockout</option>
              <option value="double_round_robin">Double Round Robin (Home & Away)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Match Overs
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.overs}
              onChange={(e) => setForm({ ...form, overs: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Ball Type
            </label>
            <select
              value={form.ballType}
              onChange={(e) => setForm({ ...form, ballType: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="leather">Red / White Leather Ball</option>
              <option value="tennis_light">Tennis (Light Ball)</option>
              <option value="tennis_heavy">Tennis (Heavy Tape Ball)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Max Teams
            </label>
            <input
              type="number"
              min={2}
              max={32}
              value={form.maxTeams}
              onChange={(e) => setForm({ ...form, maxTeams: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Points scheme configuration */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Points Table Rules Configuration
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Win Points</label>
              <input
                type="number"
                value={form.pointsWin}
                onChange={(e) => setForm({ ...form, pointsWin: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Tie Points</label>
              <input
                type="number"
                value={form.pointsTie}
                onChange={(e) => setForm({ ...form, pointsTie: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Loss Points</label>
              <input
                type="number"
                value={form.pointsLoss}
                onChange={(e) => setForm({ ...form, pointsLoss: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">No Result (NR)</label>
              <input
                type="number"
                value={form.pointsNR}
                onChange={(e) => setForm({ ...form, pointsNR: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
        >
          {loading ? "Creating..." : "Save & Initialize Tournament"}
        </button>
      </form>
    </div>
  );
}
