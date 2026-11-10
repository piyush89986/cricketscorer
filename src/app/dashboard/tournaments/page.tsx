"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, PlusCircle, Calendar, MapPin, Layers, ArrowRight, Trash2 } from "lucide-react";

export default function TournamentsListPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tournament "${name}" and its fixtures?`)) return;
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTournaments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tournaments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage cricket championships, leagues, and gully trophies</p>
        </div>
        <Link
          href="/dashboard/tournaments/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all self-stretch sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Tournament</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Tournaments Created Yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first league to generate fixtures and start scoring.</p>
          <Link
            href="/dashboard/tournaments/new"
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Tournament Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {t.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {t.format.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description || "Cricket tournament"}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{t.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{t.overs} Overs Match • {t.ballType.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(t._id, t.name)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg"
                  title="Delete Tournament"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/dashboard/tournaments/${t._id}`}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
