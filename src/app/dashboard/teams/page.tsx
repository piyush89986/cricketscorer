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
          <h1 className="text-2xl font-black text-white tracking-tight">Teams Roster</h1>
          <p className="text-sm text-slate-400 mt-1">Manage cricket clubs, squads, captains, and team assets</p>
        </div>
        <Link
          href="/dashboard/teams/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Team</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1424] border border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Teams Registered Yet</h3>
          <p className="text-sm text-slate-400 mt-1">Register teams to build squads and schedule matches.</p>
          <Link
            href="/dashboard/teams/new"
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
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
              className="bg-[#0d1424] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                    style={{ backgroundColor: t.primaryColor || "#16a34a" }}
                  >
                    {t.shortName?.substring(0, 3) || "TM"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-400">{t.city || "Club Franchise"} • {t.shortName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Captain:</span>
                    <span className="font-semibold text-slate-200">{t.captain?.name || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Wicketkeeper:</span>
                    <span className="font-semibold text-slate-200">{t.wicketkeeper?.name || "Not assigned"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <Link
                  href={`/dashboard/teams/${t._id}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
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

