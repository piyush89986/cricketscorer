"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, PlusCircle, Shield, ArrowRight, UserCheck } from "lucide-react";

export default function TeamsListPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await fetch("/api/teams");
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teams Roster</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage cricket clubs, squads, captains, and team assets</p>
        </div>
        <Link
          href="/dashboard/teams/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all self-stretch sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Team</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Teams Registered Yet</h3>
          <p className="text-sm text-slate-500 mt-1">Register teams to build squads and schedule matches.</p>
          <Link
            href="/dashboard/teams/new"
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Team</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                    style={{ backgroundColor: t.primaryColor || "#2563eb" }}
                  >
                    {t.shortName?.substring(0, 3) || "TM"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500">{t.city || "Club Franchise"} • {t.shortName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Captain:</span>
                    <span className="font-bold text-slate-800">{t.captain?.name || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wicketkeeper:</span>
                    <span className="font-bold text-slate-800">{t.wicketkeeper?.name || "Not assigned"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link
                  href={`/dashboard/teams/${t._id}`}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
                >
                  <span>Manage Squad</span>
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
