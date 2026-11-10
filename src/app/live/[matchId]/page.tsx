"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Radio,
  Tv,
  Share2,
  Printer,
  Calendar,
  MapPin,
  Trophy,
  ArrowLeft,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

export default function LiveMatchDetailPage() {
  const { matchId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "scorecard" | "commentary" | "info">("live");

  const loadMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();

    let socket: any;
    try {
      socket = getSocket();
      socket.emit("join-match", matchId);
      socket.on("score-update", () => loadMatch());
      socket.on("match-started", () => loadMatch());
    } catch (err) {
      console.warn("Socket.io live listener warning:", err);
    }

    const eventSource = new EventSource(`/api/matches/${matchId}/events`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.match) {
          setData((prev: any) => ({
            ...prev,
            match: payload.match,
            currentInnings: payload.currentInnings,
            recentDeliveries: payload.recentDeliveries,
          }));
        }
      } catch (e) {}
    };

    return () => {
      if (socket) {
        socket.emit("leave-match", matchId);
        socket.off("score-update");
      }
      eventSource.close();
    };
  }, [matchId]);

  if (loading) {
    return <div className="p-16 text-center text-slate-500">Connecting to live match feed...</div>;
  }

  const { match, inningsList = [], currentInnings, recentDeliveries = [], squads } = data || {};
  if (!match) {
    return <div className="p-16 text-center text-red-600">Match not found.</div>;
  }

  const isLive = match.status === "live" || match.status === "innings_break";
  const isCompleted = match.status === "completed";

  const crr = calculateRunRate(currentInnings?.totalRuns || 0, currentInnings?.legalBalls || 0);
  const runsRemaining = currentInnings?.target ? currentInnings.target - currentInnings.totalRuns : 0;
  const ballsRemaining = currentInnings ? match.overs * 6 - currentInnings.legalBalls : 0;
  const rrr = calculateRequiredRunRate(runsRemaining, ballsRemaining);

  const currentStriker = currentInnings?.battingScorecard?.find(
    (b: any) => b.isCurrentStriker || b.player?._id === currentInnings.currentStriker?._id
  );
  const currentNonStriker = currentInnings?.battingScorecard?.find(
    (b: any) => b.isCurrentNonStriker || b.player?._id === currentInnings.currentNonStriker?._id
  );
  const currentBowler = currentInnings?.bowlingScorecard?.find(
    (b: any) => b.isCurrentBowler || b.player?._id === currentInnings.currentBowler?._id
  );

  const shareText = encodeURIComponent(
    `🏏 Follow Live Match on CricScore: ${match.teamA?.name} vs ${match.teamB?.name}! ${
      isCompleted
        ? match.result?.summary
        : `${currentInnings?.battingTeam?.name} ${currentInnings?.totalRuns}/${currentInnings?.totalWickets} (${formatOvers(
            currentInnings?.legalBalls || 0
          )} ov)`
    }\nCheck scorecard here:`
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">
      {/* Top Navigation & Action Controls - Mobile Responsive Wrap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/live" className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          <span>All Live Matches</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText} ${typeof window !== "undefined" ? window.location.href : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
          <Link
            href={`/display/${matchId}`}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-blue-600" />
            <span>TV Mode</span>
          </Link>
        </div>
      </div>

      {/* Main Broadcast Header HUD */}
      <div className="bg-white border-2 border-blue-100 rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-3">
          <span className="font-bold text-slate-500 uppercase tracking-wider">
            {match.tournament?.name} • Match #{match.matchNumber} ({match.stage})
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto ${
              isLive
                ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                : isCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {match.status.replace("_", " ")}
          </span>
        </div>

        {/* Teams and Scores comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-100 my-2">
          {/* Team A */}
          <div className="flex items-center justify-between bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-sm"
                style={{ backgroundColor: match.teamA?.primaryColor || "#2563eb" }}
              >
                {match.teamA?.shortName?.substring(0, 3) || "TA"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{match.teamA?.name}</h2>
                <p className="text-xs text-slate-500">{match.teamA?.city || "Club"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {match.summary?.teamAScore?.runs ?? 0}/{match.summary?.teamAScore?.wickets ?? 0}
              </span>
              <p className="text-xs text-slate-500 font-mono">
                {formatOvers(match.summary?.teamAScore?.legalBalls ?? 0)} ov
              </p>
            </div>
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-sm"
                style={{ backgroundColor: match.teamB?.primaryColor || "#1d4ed8" }}
              >
                {match.teamB?.shortName?.substring(0, 3) || "TB"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{match.teamB?.name}</h2>
                <p className="text-xs text-slate-500">{match.teamB?.city || "Club"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono block">
                {match.summary?.teamBScore?.runs ?? 0}/{match.summary?.teamBScore?.wickets ?? 0}
              </span>
              <p className="text-xs text-slate-500 font-mono">
                {formatOvers(match.summary?.teamBScore?.legalBalls ?? 0)} ov
              </p>
            </div>
          </div>
        </div>

        {/* Live Equation / Result Summary */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div>
            {match.result?.summary ? (
              <span className="text-blue-700 font-bold text-sm">{match.result.summary}</span>
            ) : currentInnings?.target ? (
              <span className="text-amber-700 font-bold">
                {currentInnings.battingTeam?.name} need {runsRemaining} runs in {ballsRemaining} balls (RRR: {rrr})
              </span>
            ) : match.toss?.winner ? (
              <span className="text-slate-700 font-medium">
                {match.toss.winner.name} won the toss and chose to {match.toss.decision} first
              </span>
            ) : (
              <span className="text-slate-500">Match scheduled at {match.venue}</span>
            )}
          </div>
          <div className="text-slate-500 font-medium">
            CRR: <strong className="text-slate-900 font-mono">{crr}</strong>
          </div>
        </div>

        {/* Recent Deliveries Ribbon */}
        {recentDeliveries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Last Balls:
            </span>
            <div className="flex items-center space-x-1.5">
              {recentDeliveries.slice(0, 12).map((d: any, idx: number) => {
                let badge = "bg-slate-100 text-slate-700 border-slate-200";
                let text = `${d.totalRuns}`;

                if (d.wicket?.isWicket) {
                  badge = "bg-red-600 text-white border-red-500 font-black";
                  text = "W";
                } else if (d.runsBatter === 6) {
                  badge = "bg-indigo-600 text-white border-indigo-500 font-black";
                  text = "6";
                } else if (d.runsBatter === 4) {
                  badge = "bg-blue-600 text-white border-blue-500 font-black";
                  text = "4";
                } else if (d.extras?.type === "wide") {
                  badge = "bg-amber-100 text-amber-800 border-amber-300 font-bold";
                  text = "WD";
                } else if (d.extras?.type === "no_ball") {
                  badge = "bg-orange-100 text-orange-800 border-orange-300 font-bold";
                  text = "NB";
                } else if (d.totalRuns === 0) {
                  text = "•";
                  badge = "bg-slate-100 text-slate-400 border-slate-200";
                }

                return (
                  <span
                    key={d._id || idx}
                    className={`w-7 h-7 rounded-lg border text-xs font-mono font-bold flex items-center justify-center ${badge}`}
                  >
                    {text}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Menu - Mobile Responsive Scroll */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "live", label: "Live Telemetry" },
          { id: "scorecard", label: "Full Scorecard" },
          { id: "commentary", label: "Commentary" },
          { id: "info", label: "Match Info & Squads" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Live Center */}
      {activeTab === "live" && currentInnings && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Batters */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Current Batsmen at Crease
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">
                        {currentInnings.currentStriker?.name || "Striker"} *
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Facing Striker</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-blue-700 text-sm">
                      {currentStriker?.runs ?? 0} ({currentStriker?.balls ?? 0}b)
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SR: {currentStriker?.strikeRate ?? 0} • {currentStriker?.fours ?? 0}x4 {currentStriker?.sixes ?? 0}x6
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="font-bold text-slate-700 text-sm">
                        {currentInnings.currentNonStriker?.name || "Non-Striker"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Non-Striker</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-700 text-sm">
                      {currentNonStriker?.runs ?? 0} ({currentNonStriker?.balls ?? 0}b)
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SR: {currentNonStriker?.strikeRate ?? 0} • {currentNonStriker?.fours ?? 0}x4 {currentNonStriker?.sixes ?? 0}x6
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bowler */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Current Bowler in Attack
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {currentInnings.currentBowler?.name || "Bowler"}
                    </span>
                    <p className="text-[10px] text-slate-500">Attack Pace / Spin</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-blue-700 text-sm">
                      {currentBowler ? formatOvers(currentBowler.legalBalls) : "0.0"} - {currentBowler?.maidens ?? 0} -{" "}
                      {currentBowler?.runsConceded ?? 0} - {currentBowler?.wickets ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-500">Econ: {currentBowler?.economy ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Fall of Wickets Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Fall of Wickets:
                </span>
                {currentInnings.fallOfWickets?.length === 0 ? (
                  <span className="text-slate-400 text-xs">No wickets down yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentInnings.fallOfWickets.map((f: any) => (
                      <span
                        key={f.wicketNumber}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] text-slate-700 font-mono border border-slate-200"
                      >
                        {f.score}/{f.wicketNumber} ({f.player?.name || "Wkt"}, {f.overs} ov)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Full Scorecard */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          {inningsList.map((inn: any) => (
            <div key={inn._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {inn.battingTeam?.name} Innings #{inn.inningsNumber}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Total: {inn.totalRuns}/{inn.totalWickets} in {formatOvers(inn.legalBalls)} overs (Extras: {inn.extras?.total || 0})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  RR: {calculateRunRate(inn.totalRuns, inn.legalBalls)}
                </span>
              </div>

              {/* Batting table - mobile scrollable */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-100/60 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Batter</th>
                      <th className="py-2.5 px-4">Dismissal</th>
                      <th className="py-2.5 px-3 text-right">R</th>
                      <th className="py-2.5 px-3 text-right">B</th>
                      <th className="py-2.5 px-3 text-right">4s</th>
                      <th className="py-2.5 px-3 text-right">6s</th>
                      <th className="py-2.5 px-4 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {inn.battingScorecard.map((b: any) => (
                      <tr key={b._id || b.player?._id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {b.player?.name || "Batsman"}
                          {b.isCurrentStriker && <span className="text-blue-600 ml-1 font-black">*</span>}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-[200px]">
                          {b.dismissalText || (b.isOut ? "out" : "not out")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{b.runs}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{b.balls}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{b.fours}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{b.sixes}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-700 font-bold">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling table */}
              <div className="border-t border-slate-200">
                <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Bowling Figures
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono min-w-[500px]">
                    <thead className="bg-slate-100/60 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-4 font-sans">Bowler</th>
                        <th className="py-2 px-3 text-right">O</th>
                        <th className="py-2 px-3 text-right">M</th>
                        <th className="py-2 px-3 text-right">R</th>
                        <th className="py-2 px-3 text-right">W</th>
                        <th className="py-2 px-4 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inn.bowlingScorecard.map((bowl: any) => (
                        <tr key={bowl._id || bowl.player?._id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-sans font-bold text-slate-900">
                            {bowl.player?.name || "Bowler"}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatOvers(bowl.legalBalls)}</td>
                          <td className="py-2 px-3 text-right text-slate-500">{bowl.maidens}</td>
                          <td className="py-2 px-3 text-right text-slate-700 font-semibold">{bowl.runsConceded}</td>
                          <td className="py-2 px-3 text-right font-bold text-blue-700">{bowl.wickets}</td>
                          <td className="py-2 px-4 text-right text-slate-700">{bowl.economy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Commentary */}
      {activeTab === "commentary" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Live Ball-by-Ball Commentary</h3>
          {recentDeliveries.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No deliveries recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentDeliveries.map((del: any) => (
                <div
                  key={del._id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3 text-xs"
                >
                  <span className="w-10 h-7 rounded-lg bg-blue-100 font-mono font-bold text-blue-700 flex items-center justify-center text-xs shrink-0">
                    {del.overNumber}.{del.ballNumber}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-slate-900">{del.bowler?.name || "Bowler"} to {del.striker?.name || "Striker"}</span>
                      {del.wicket?.isWicket && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px]">
                          WICKET
                        </span>
                      )}
                      {del.runsBatter === 6 && (
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                          SIX
                        </span>
                      )}
                      {del.runsBatter === 4 && (
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                          FOUR
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{del.commentary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Match Info & Playing XIs */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Match Information</h3>
            <p><span className="text-slate-500">Tournament:</span> <strong className="text-slate-900">{match.tournament?.name}</strong></p>
            <p><span className="text-slate-500">Venue:</span> <strong className="text-slate-900">{match.venue}</strong></p>
            <p><span className="text-slate-500">Date & Time:</span> <strong className="text-slate-900">{new Date(match.date).toLocaleDateString()} at {match.time}</strong></p>
            <p><span className="text-slate-500">Overs Quota:</span> <strong className="text-slate-900">{match.overs} Overs per side</strong></p>
            <p><span className="text-slate-500">Umpires:</span> <strong className="text-slate-900">{match.assignedUmpire || "Official Panel"}</strong></p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Playing Squads</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-bold text-blue-700 mb-1.5">{match.teamA?.name}</p>
                <div className="space-y-1">
                  {squads?.teamA?.slice(0, 11).map((p: any) => (
                    <p key={p._id} className="text-slate-700 truncate">
                      {p.name}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-blue-900 mb-1.5">{match.teamB?.name}</p>
                <div className="space-y-1">
                  {squads?.teamB?.slice(0, 11).map((p: any) => (
                    <p key={p._id} className="text-slate-700 truncate">
                      {p.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
