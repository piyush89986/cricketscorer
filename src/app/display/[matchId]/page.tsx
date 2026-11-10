"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Maximize, Minimize, RefreshCw, Trophy, Radio, Flame, Sparkles } from "lucide-react";
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

export default function TVScoreboardPage() {
  const { matchId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayout, setActiveLayout] = useState<"main" | "batting" | "bowling" | "standings" | "result">("main");
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Socket.IO
    let socket: any;
    try {
      socket = getSocket();
      socket.emit("join-match", matchId);
      socket.on("score-update", () => loadMatch());
      socket.on("match-started", () => loadMatch());
    } catch (err) {
      console.warn("Socket.io tv display warning:", err);
    }

    // SSE Stream fallback
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

  // Auto rotation timer between layouts
  useEffect(() => {
    if (!autoRotate) return;
    const layouts: ("main" | "batting" | "bowling")[] = ["main", "batting", "bowling"];
    const interval = setInterval(() => {
      setActiveLayout((current) => {
        const currentIndex = layouts.indexOf(current as any);
        const nextIndex = (currentIndex + 1) % layouts.length;
        return layouts[nextIndex];
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040711] flex items-center justify-center text-slate-400 font-mono text-xl">
        INITIALIZING STADIUM BROADCAST SCREEN...
      </div>
    );
  }

  const { match, currentInnings, inningsList = [], recentDeliveries = [] } = data || {};
  if (!match) return <div className="p-12 text-center text-white">Match not found.</div>;

  const isCompleted = match.status === "completed";
  const crr = calculateRunRate(currentInnings?.totalRuns || 0, currentInnings?.legalBalls || 0);
  const runsRemaining = currentInnings?.target ? currentInnings.target - currentInnings.totalRuns : 0;
  const ballsRemaining = currentInnings ? match.overs * 6 - currentInnings.legalBalls : 0;
  const rrr = calculateRequiredRunRate(runsRemaining, ballsRemaining);

  const striker = currentInnings?.battingScorecard?.find((b: any) => b.isCurrentStriker);
  const nonStriker = currentInnings?.battingScorecard?.find((b: any) => b.isCurrentNonStriker);
  const bowler = currentInnings?.bowlingScorecard?.find((b: any) => b.isCurrentBowler);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#060b17] text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden relative"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 15%, #0f1c38 0%, #060b17 75%, #03060d 100%)",
      }}
    >
      {/* Stadium Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/90 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20">
            🏏
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              STADIUM BROADCAST SCOREBOARD
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {match.tournament?.name}
            </h1>
          </div>
        </div>

        {/* Layout switcher & Fullscreen toggles */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveLayout("main")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayout === "main" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Main Score
            </button>
            <button
              onClick={() => setActiveLayout("batting")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayout === "batting" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Batting Card
            </button>
            <button
              onClick={() => setActiveLayout("bowling")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeLayout === "bowling" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Bowling Card
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1 ${
              autoRotate
                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
            title="Auto cycle between scoreboards every 12s"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Auto Cycle</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300"
            title="Toggle Stadium Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* VIEW 1: Main Stadium Scoreboard */}
      {activeLayout === "main" && (
        <main className="flex-1 my-6 flex flex-col justify-center space-y-6 max-w-7xl mx-auto w-full">
          {/* Main Giant Scores Board */}
          <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Team A */}
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  currentInnings?.battingTeam?._id === match.teamA._id
                    ? "bg-slate-900/90 border-emerald-500/60 shadow-xl shadow-emerald-500/10"
                    : "bg-slate-950/40 border-slate-800/80 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl"
                      style={{ backgroundColor: match.teamA?.primaryColor || "#0284c7" }}
                    >
                      {match.teamA?.shortName?.substring(0, 3)}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {match.teamA?.name}
                      </h2>
                      {currentInnings?.battingTeam?._id === match.teamA._id && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                          BATTING NOW
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                      {match.summary?.teamAScore?.runs ?? 0}/{match.summary?.teamAScore?.wickets ?? 0}
                    </span>
                    <p className="text-base sm:text-lg text-slate-400 font-mono mt-1">
                      {formatOvers(match.summary?.teamAScore?.legalBalls ?? 0)} OVERS
                    </p>
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  currentInnings?.battingTeam?._id === match.teamB._id
                    ? "bg-slate-900/90 border-emerald-500/60 shadow-xl shadow-emerald-500/10"
                    : "bg-slate-950/40 border-slate-800/80 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl"
                      style={{ backgroundColor: match.teamB?.primaryColor || "#dc2626" }}
                    >
                      {match.teamB?.shortName?.substring(0, 3)}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {match.teamB?.name}
                      </h2>
                      {currentInnings?.battingTeam?._id === match.teamB._id && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                          BATTING NOW
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                      {match.summary?.teamBScore?.runs ?? 0}/{match.summary?.teamBScore?.wickets ?? 0}
                    </span>
                    <p className="text-base sm:text-lg text-slate-400 font-mono mt-1">
                      {formatOvers(match.summary?.teamBScore?.legalBalls ?? 0)} OVERS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stadium Match Equation Banner */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
              <div>
                {isCompleted ? (
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wide">
                    🏆 {match.result?.summary}
                  </span>
                ) : currentInnings?.target ? (
                  <span className="text-lg sm:text-xl font-black text-amber-400 tracking-wide">
                    {currentInnings.battingTeam?.name} NEED {runsRemaining} RUNS IN {ballsRemaining} BALLS (RRR: {rrr})
                  </span>
                ) : (
                  <span className="text-base font-bold text-slate-300">
                    1ST INNINGS IN PROGRESS • {match.venue}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm font-mono font-bold text-slate-300">
                <span>CRR: <strong className="text-white text-base">{crr}</strong></span>
                <span>OVERS: <strong className="text-white text-base">{match.overs}</strong></span>
              </div>
            </div>
          </div>

          {/* Batters & Bowler Stadium Graphic Cards */}
          {currentInnings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Striker */}
              <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    STRIKER (*)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    SR: {striker?.strikeRate ?? 0}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white truncate">
                  {currentInnings.currentStriker?.name || "Striker"}
                </h3>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white font-mono">{striker?.runs ?? 0}</span>
                  <span className="text-sm font-semibold text-slate-400 font-mono">
                    ({striker?.balls ?? 0}b • {striker?.fours ?? 0}x4 {striker?.sixes ?? 0}x6)
                  </span>
                </div>
              </div>

              {/* Non-Striker */}
              <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    NON-STRIKER
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    SR: {nonStriker?.strikeRate ?? 0}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white truncate">
                  {currentInnings.currentNonStriker?.name || "Non-Striker"}
                </h3>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-200 font-mono">{nonStriker?.runs ?? 0}</span>
                  <span className="text-sm font-semibold text-slate-400 font-mono">
                    ({nonStriker?.balls ?? 0}b • {nonStriker?.fours ?? 0}x4 {nonStriker?.sixes ?? 0}x6)
                  </span>
                </div>
              </div>

              {/* Bowler */}
              <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    BOWLER
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ECON: {bowler?.economy ?? 0}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white truncate">
                  {currentInnings.currentBowler?.name || "Bowler"}
                </h3>
                <div className="mt-2 flex items-baseline space-x-2 font-mono">
                  <span className="text-3xl font-black text-amber-400">
                    {bowler?.wickets ?? 0}/{bowler?.runsConceded ?? 0}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    ({bowler ? formatOvers(bowler.legalBalls) : "0.0"} ov)
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* VIEW 2: Batting Card */}
      {activeLayout === "batting" && currentInnings && (
        <main className="flex-1 my-6 flex flex-col justify-center max-w-7xl mx-auto w-full">
          <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider text-emerald-400">
              {currentInnings.battingTeam?.name} — BATTING SCORECARD
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Batsman</th>
                    <th className="py-3 px-4">Dismissal Detail</th>
                    <th className="py-3 px-4 text-right">Runs</th>
                    <th className="py-3 px-4 text-right">Balls</th>
                    <th className="py-3 px-4 text-right">4s</th>
                    <th className="py-3 px-4 text-right">6s</th>
                    <th className="py-3 px-4 text-right">Strike Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {currentInnings.battingScorecard.map((b: any) => (
                    <tr key={b._id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white text-base">
                        {b.player?.name}
                        {b.isCurrentStriker && <span className="text-emerald-400 ml-1.5">*</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{b.dismissalText || "not out"}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-xl text-white">{b.runs}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{b.balls}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{b.fours}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{b.sixes}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">{b.strikeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 3: Bowling Card */}
      {activeLayout === "bowling" && currentInnings && (
        <main className="flex-1 my-6 flex flex-col justify-center max-w-7xl mx-auto w-full">
          <div className="bg-[#0b1426]/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider text-amber-400">
              {currentInnings.bowlingTeam?.name} — BOWLING FIGURES
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4 font-sans">Bowler</th>
                    <th className="py-3 px-4 text-right">Overs</th>
                    <th className="py-3 px-4 text-right">Maidens</th>
                    <th className="py-3 px-4 text-right">Runs</th>
                    <th className="py-3 px-4 text-right">Wickets</th>
                    <th className="py-3 px-4 text-right">Economy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {currentInnings.bowlingScorecard.map((bowl: any) => (
                    <tr key={bowl._id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-sans font-bold text-white text-base">
                        {bowl.player?.name}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">{formatOvers(bowl.legalBalls)}</td>
                      <td className="py-3 px-4 text-right text-slate-400">{bowl.maidens}</td>
                      <td className="py-3 px-4 text-right text-slate-200">{bowl.runsConceded}</td>
                      <td className="py-3 px-4 text-right font-black text-amber-400 text-xl">{bowl.wickets}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">{bowl.economy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* Stadium Bottom Ticker */}
      <footer className="border-t border-slate-800/90 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold">CRICSCORE REAL-TIME STADIUM BROADCAST</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>VENUE: {match.venue?.toUpperCase()}</span>
          <span>DATE: {new Date(match.date).toLocaleDateString()}</span>
        </div>
      </footer>
    </div>
  );
}

