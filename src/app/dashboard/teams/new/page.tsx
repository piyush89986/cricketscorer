"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, AlertCircle } from "lucide-react";

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    city: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create team");

      router.push(`/dashboard/teams/${data.team._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/dashboard/teams"
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Register New Team</h1>
          <p className="text-xs text-slate-500">Set team branding, short initials, and city</p>
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
            Team Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Hyderabad Hawks"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Short Code (2-4 Letters) *
            </label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="e.g. HH"
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm uppercase font-mono font-bold focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              City / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Hyderabad"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Jersey Color Accent
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono font-bold text-slate-700">{form.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Badge Preview
            </label>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
              style={{ backgroundColor: form.primaryColor }}
            >
              {form.shortName || "HH"}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
        >
          {loading ? "Registering Team..." : "Save & Continue to Squad"}
        </button>
      </form>
    </div>
  );
}
