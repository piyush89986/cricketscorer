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

    // Attach Socket.IO live listener
    let socket: any;
    try {
      socket = getSocket();
      socket.emit("join-match", matchId);
      socket.on("score-update", () => {
        loadMatch();
      });
      socket.on("match-started", () => {
        loadMatch();
      });
    } catch (err) {
      console.warn("Socket.io connection warning:", err);
    }

    // Attach Server-Sent Events (SSE) fallback stream
    const eventSource = new EventSource(`/api/matches/${matchId}/events`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.match) {
          setData((prev: any) => ({
            ...prev,
            match: payload.match,
            currentInnings: payload.currentInnings,
            recentDeliveries: payload.recentDeliveries,
          }));
        }
      } catch (e) {
        // Parse error
      }
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
    return <div className="p-16 text-center text-slate-400">Connecting to live match feed...</div>;
  }

  const { match, inningsList = [], currentInnings, recentDeliveries = [], squads } = data || {};
  if (!match) {
    return <div className="p-16 text-center text-red-400">Match not found.</div>;
  }

  const isLive = match.status === "live" || match.status === "innings_break";
  const isCompleted = match.status === "completed";

  const crr = calculateRunRate(currentInnings?.totalRuns || 0, currentInnings?.legalBalls || 0);
  const runsRemaining = currentInnings?.target ? currentInnings.target - currentInnings.totalRuns : 0;
  const ballsRemaining = currentInnings ? match.overs * 6 - currentInnings.legalBalls : 0;
  const rrr = calculateRequiredRunRate(runsRemaining, ballsRemaining);

  // Active Players
  const currentStriker = currentInnings?.battingScorecard?.find(
    (b: any) => b.isCurrentStriker || b.player?._id === currentInnings.currentStriker?._id
  );
  const currentNonStriker = currentInnings?.battingScorecard?.find(
    (b: any) => b.isCurrentNonStriker || b.player?._id === currentInnings.currentNonStriker?._id
  );
  const currentBowler = currentInnings?.bowlingScorecard?.find(
    (b: any) => b.isCurrentBowler || b.player?._id === currentInnings.currentBowler?._id
  );

  // WhatsApp share
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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/live" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>All Live Matches</span>
        </Link>

        <div className="flex items-center space-x-2">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText} ${typeof window !== "undefined" ? window.location.href : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share WhatsApp</span>
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Scorecard</span>
          </button>
          <Link
            href={`/display/${matchId}`}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV Mode</span>
          </Link>
        </div>
      </div>

      {/* Main Broadcast Header HUD */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            {match.tournament?.name} • Match #{match.matchNumber} ({match.stage})
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isLive
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                : isCompleted
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {match.status.replace("_", " ")}
          </span>
        </div>

        {/* Teams and Scores comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-800/80 my-2">
          {/* Team A */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg"
                style={{ backgroundColor: match.teamA?.primaryColor || "#16a34a" }}
              >
                {match.teamA?.shortName?.substring(0, 3) || "TA"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{match.teamA?.name}</h2>
                <p className="text-xs text-slate-400">{match.teamA?.city || "Club"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {match.summary?.teamAScore?.runs ?? 0}/{match.summary?.teamAScore?.wickets ?? 0}
              </span>
              <p className="text-xs text-slate-400 font-mono">
                {formatOvers(match.summary?.teamAScore?.legalBalls ?? 0)} ov
              </p>
            </div>
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg"
                style={{ backgroundColor: match.teamB?.primaryColor || "#dc2626" }}
              >
                {match.teamB?.shortName?.substring(0, 3) || "TB"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{match.teamB?.name}</h2>
                <p className="text-xs text-slate-400">{match.teamB?.city || "Club"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {match.summary?.teamBScore?.runs ?? 0}/{match.summary?.teamBScore?.wickets ?? 0}
              </span>
              <p className="text-xs text-slate-400 font-mono">
                {formatOvers(match.summary?.teamBScore?.legalBalls ?? 0)} ov
              </p>
            </div>
          </div>
        </div>

        {/* Live Equation / Result Summary */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div>
            {match.result?.summary ? (
              <span className="text-emerald-400 font-bold text-sm">{match.result.summary}</span>
            ) : currentInnings?.target ? (
              <span className="text-amber-400 font-bold">
                {currentInnings.battingTeam?.name} need {runsRemaining} runs in {ballsRemaining} balls (RRR: {rrr})
              </span>
            ) : match.toss?.winner ? (
              <span className="text-slate-300">
                {match.toss.winner.name} won the toss and chose to {match.toss.decision} first
              </span>
            ) : (
              <span className="text-slate-400">Match scheduled at {match.venue}</span>
            )}
          </div>
          <div className="text-slate-400">
            CRR: <strong className="text-white font-mono">{crr}</strong>
          </div>
        </div>

        {/* Recent Deliveries Ribbon */}
        {recentDeliveries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Last Balls:
            </span>
            <div className="flex items-center space-x-1.5">
              {recentDeliveries.slice(0, 12).map((d: any, idx: number) => {
                let badge = "bg-slate-800 text-slate-200 border-slate-700";
                let text = `${d.totalRuns}`;

                if (d.wicket?.isWicket) {
                  badge = "bg-red-600 text-white border-red-500 font-black";
                  text = "W";
                } else if (d.runsBatter === 6) {
                  badge = "bg-purple-600 text-white border-purple-500 font-black";
                  text = "6";
                } else if (d.runsBatter === 4) {
                  badge = "bg-blue-600 text-white border-blue-500 font-black";
                  text = "4";
                } else if (d.extras?.type === "wide") {
                  badge = "bg-amber-600 text-white border-amber-500";
                  text = "WD";
                } else if (d.extras?.type === "no_ball") {
                  badge = "bg-orange-600 text-white border-orange-500";
                  text = "NB";
                } else if (d.totalRuns === 0) {
                  text = "•";
                  badge = "bg-slate-900 text-slate-500 border-slate-800";
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

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {[
          { id: "live", label: "Live Telemetry" },
          { id: "scorecard", label: "Full Scorecard" },
          { id: "commentary", label: "Commentary" },
          { id: "info", label: "Match Info & Squads" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Live Center */}
      {activeTab === "live" && currentInnings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Batters */}
            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Current Batsmen at Crease
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white text-sm">
                        {currentInnings.currentStriker?.name || "Striker"} *
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Facing Striker</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {currentStriker?.runs ?? 0} ({currentStriker?.balls ?? 0}b)
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SR: {currentStriker?.strikeRate ?? 0} • {currentStriker?.fours ?? 0}x4 {currentStriker?.sixes ?? 0}x6
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="font-bold text-slate-200 text-sm">
                        {currentInnings.currentNonStriker?.name || "Non-Striker"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Non-Striker</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-300 text-sm">
                      {currentNonStriker?.runs ?? 0} ({currentNonStriker?.balls ?? 0}b)
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SR: {currentNonStriker?.strikeRate ?? 0} • {currentNonStriker?.fours ?? 0}x4 {currentNonStriker?.sixes ?? 0}x6
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bowler */}
            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Current Bowler in Attack
                </h3>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">
                      {currentInnings.currentBowler?.name || "Bowler"}
                    </span>
                    <p className="text-[10px] text-slate-400">Fast / Medium Attack</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-amber-400 text-sm">
                      {currentBowler ? formatOvers(currentBowler.legalBalls) : "0.0"} - {currentBowler?.maidens ?? 0} -{" "}
                      {currentBowler?.runsConceded ?? 0} - {currentBowler?.wickets ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-400">Econ: {currentBowler?.economy ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Fall of Wickets Preview */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Fall of Wickets:
                </span>
                {currentInnings.fallOfWickets?.length === 0 ? (
                  <span className="text-slate-500 text-xs">No wickets down yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentInnings.fallOfWickets.map((f: any) => (
                      <span
                        key={f.wicketNumber}
                        className="px-2 py-1 rounded-lg bg-slate-800/80 text-[10px] text-slate-300 font-mono border border-slate-700"
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
            <div key={inn._id} className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {inn.battingTeam?.name} Innings #{inn.inningsNumber}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Total: {inn.totalRuns}/{inn.totalWickets} in {formatOvers(inn.legalBalls)} overs (Extras: {inn.extras?.total || 0})
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  RR: {calculateRunRate(inn.totalRuns, inn.legalBalls)}
                </span>
              </div>

              {/* Batting table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
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
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {inn.battingScorecard.map((b: any) => (
                      <tr key={b._id || b.player?._id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-bold text-white">
                          {b.player?.name || "Batsman"}
                          {b.isCurrentStriker && <span className="text-emerald-400 ml-1">*</span>}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-[200px]">
                          {b.dismissalText || (b.isOut ? "out" : "not out")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{b.runs}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{b.balls}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{b.fours}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">{b.sixes}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-400">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bowling table */}
              <div className="border-t border-slate-800/80">
                <div className="px-4 py-2 bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bowling Figures
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-4">Bowler</th>
                        <th className="py-2 px-3 text-right">O</th>
                        <th className="py-2 px-3 text-right">M</th>
                        <th className="py-2 px-3 text-right">R</th>
                        <th className="py-2 px-3 text-right">W</th>
                        <th className="py-2 px-4 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {inn.bowlingScorecard.map((bowl: any) => (
                        <tr key={bowl._id || bowl.player?._id} className="hover:bg-slate-800/30">
                          <td className="py-2 px-4 font-sans font-bold text-white">
                            {bowl.player?.name || "Bowler"}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">{formatOvers(bowl.legalBalls)}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{bowl.maidens}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{bowl.runsConceded}</td>
                          <td className="py-2 px-3 text-right font-bold text-amber-400">{bowl.wickets}</td>
                          <td className="py-2 px-4 text-right text-emerald-400">{bowl.economy}</td>
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
        <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">Live Ball-by-Ball Commentary</h3>
          {recentDeliveries.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No deliveries recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDeliveries.map((del: any) => (
                <div
                  key={del._id}
                  className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs"
                >
                  <span className="w-10 h-7 rounded-lg bg-slate-800 font-mono font-bold text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    {del.overNumber}.{del.ballNumber}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">{del.bowler?.name || "Bowler"} to {del.striker?.name || "Striker"}</span>
                      {del.wicket?.isWicket && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                          WICKET
                        </span>
                      )}
                      {del.runsBatter === 6 && (
                        <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                          SIX
                        </span>
                      )}
                      {del.runsBatter === 4 && (
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                          FOUR
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{del.commentary}</p>
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
          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm mb-2">Match Information</h3>
            <p><span className="text-slate-500">Tournament:</span> <strong className="text-white">{match.tournament?.name}</strong></p>
            <p><span className="text-slate-500">Venue:</span> <strong className="text-white">{match.venue}</strong></p>
            <p><span className="text-slate-500">Date & Time:</span> <strong className="text-white">{new Date(match.date).toLocaleDateString()} at {match.time}</strong></p>
            <p><span className="text-slate-500">Overs Quota:</span> <strong className="text-white">{match.overs} Overs per side</strong></p>
            <p><span className="text-slate-500">Umpires:</span> <strong className="text-white">{match.assignedUmpire || "Official Panel"}</strong></p>
          </div>

          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm mb-2">Playing Squads</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-bold text-emerald-400 mb-1.5">{match.teamA?.name}</p>
                <div className="space-y-1">
                  {squads?.teamA?.slice(0, 11).map((p: any) => (
                    <p key={p._id} className="text-slate-300 truncate">
                      {p.name}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-blue-400 mb-1.5">{match.teamB?.name}</p>
                <div className="space-y-1">
                  {squads?.teamB?.slice(0, 11).map((p: any) => (
                    <p key={p._id} className="text-slate-300 truncate">
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
