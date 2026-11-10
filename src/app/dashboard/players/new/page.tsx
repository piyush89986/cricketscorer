"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, ArrowLeft, AlertCircle } from "lucide-react";

export default function NewPlayerPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    jerseyNumber: "",
    role: "all_rounder",
    battingStyle: "right_hand",
    bowlingStyle: "right_arm_medium",
    age: "",
    currentTeamId: "",
  });

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create player");

      router.push("/dashboard/players");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/dashboard/players" className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Create Player Profile</h1>
          <p className="text-xs text-slate-500">Add a reusable player to participate in tournaments</p>
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
            Player Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Jasprit Bumrah"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Playing Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="all_rounder">All-Rounder</option>
              <option value="wicket_keeper">Wicketkeeper</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Default Team (Optional)
            </label>
            <select
              value={form.currentTeamId}
              onChange={(e) => setForm({ ...form, currentTeamId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="">-- No primary team --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Batting Style
            </label>
            <select
              value={form.battingStyle}
              onChange={(e) => setForm({ ...form, battingStyle: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="right_hand">Right-Hand Bat</option>
              <option value="left_hand">Left-Hand Bat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Bowling Style
            </label>
            <select
              value={form.bowlingStyle}
              onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="right_arm_fast">Right-Arm Fast</option>
              <option value="right_arm_medium">Right-Arm Medium</option>
              <option value="right_arm_spin">Right-Arm Spin</option>
              <option value="left_arm_fast">Left-Arm Fast</option>
              <option value="left_arm_medium">Left-Arm Medium</option>
              <option value="left_arm_spin">Left-Arm Spin</option>
              <option value="none">Does Not Bowl</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Jersey Number
            </label>
            <input
              type="number"
              placeholder="e.g. 93"
              value={form.jerseyNumber}
              onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Age (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 28"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
        >
          {loading ? "Saving Player..." : "Create Player Profile"}
        </button>
      </form>
    </div>
  );
}
