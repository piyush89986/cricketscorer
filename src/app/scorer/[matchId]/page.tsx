"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Flame,
  Award,
  Tv,
  CheckCircle2,
  AlertCircle,
  Radio,
  Shuffle,
  ChevronRight,
} from "lucide-react";
import { formatOvers, calculateRunRate, calculateRequiredRunRate } from "@/lib/utils";

export default function ScorerMatchConsole() {
  const { matchId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showTossModal, setShowTossModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showNewBatterModal, setShowNewBatterModal] = useState(false);

  // Toss form state
  const [tossWinner, setTossWinner] = useState("");
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");
  const [openingStriker, setOpeningStriker] = useState("");
  const [openingNonStriker, setOpeningNonStriker] = useState("");
  const [openingBowler, setOpeningBowler] = useState("");

  // Wicket form state
  const [wicketType, setWicketType] = useState<string>("caught");
  const [dismissedBatterId, setDismissedBatterId] = useState<string>("");
  const [fielderId, setFielderId] = useState<string>("");
  const [incomingBatterId, setIncomingBatterId] = useState<string>("");

  // Next Bowler state
  const [nextBowlerId, setNextBowlerId] = useState<string>("");

  const loadMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const d = await res.json();
      setData(d);

      if (d.match && d.match.status === "upcoming") {
        setShowTossModal(true);
        setTossWinner(d.match.teamA._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  // Handle Toss and Start Match
  const handleStartMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch(`/api/matches/${matchId}/toss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tossWinnerId: tossWinner,
          tossDecision,
          strikerId: openingStriker,
          nonStrikerId: openingNonStriker,
          openingBowlerId: openingBowler,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record toss");
      }

      setShowTossModal(false);
      await loadMatch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Ball Delivery
  const submitBall = async (payload: {
    runsBatter: number;
    extraType: string;
    extraRuns: number;
    isWicket?: boolean;
    wicketType?: string;
    playerDismissedId?: string;
    newBatterId?: string;
    newBowlerId?: string;
    fielderId?: string;
  }) => {
    if (!data?.currentInnings) return;
    setActionLoading(true);

    const idempotencyKey = `${matchId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      const res = await fetch(`/api/matches/${matchId}/scoring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inningsId: data.currentInnings._id,
          ...payload,
          idempotencyKey,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to record delivery");

      await loadMatch();

      // Check if over was completed
      if (resData.isOverComplete) {
        setShowBowlerModal(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Undo Last Ball
  const handleUndo = async () => {
    if (!confirm("Are you sure you want to undo the last delivery?")) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/matches/${matchId}/undo`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to undo delivery");
      }

      await loadMatch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Confirm Wicket
  const handleConfirmWicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowWicketModal(false);

    await submitBall({
      runsBatter: 0,
      extraType: "none",
      extraRuns: 0,
      isWicket: true,
      wicketType,
      playerDismissedId: dismissedBatterId || data.currentInnings.currentStriker?._id,
      fielderId: fielderId || undefined,
      newBatterId: incomingBatterId || undefined,
    });

    setWicketType("caught");
    setDismissedBatterId("");
    setFielderId("");
    setIncomingBatterId("");
  };

  // Handle Select Next Bowler
  const handleConfirmBowler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextBowlerId) return;

    setShowBowlerModal(false);
    // Submit 0 run / bowler assignment delivery or update pointer
    await submitBall({
      runsBatter: 0,
      extraType: "none",
      extraRuns: 0,
      newBowlerId: nextBowlerId,
    });
    setNextBowlerId("");
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading scoring console...</div>;
  }

  const { match, currentInnings, recentDeliveries = [], squads } = data || {};
  const isMatchLive = match?.status === "live";
  const isCompleted = match?.status === "completed";

  // Batters & Bowlers
  const currentStrikerScore = currentInnings?.battingScorecard?.find(
    (b: any) => b.player?._id === currentInnings.currentStriker?._id || b.isCurrentStriker
  );
  const currentNonStrikerScore = currentInnings?.battingScorecard?.find(
    (b: any) => b.player?._id === currentInnings.currentNonStriker?._id || b.isCurrentNonStriker
  );
  const currentBowlerFigure = currentInnings?.bowlingScorecard?.find(
    (b: any) => b.player?._id === currentInnings.currentBowler?._id || b.isCurrentBowler
  );

  const battingSquad =
    match.teamA?._id === currentInnings?.battingTeam?._id ? squads?.teamA : squads?.teamB;
  const bowlingSquad =
    match.teamA?._id === currentInnings?.bowlingTeam?._id ? squads?.teamA : squads?.teamB;

  // Unbatted players for new batter modal
  const outPlayerIds = currentInnings?.battingScorecard
    ?.filter((b: any) => b.isOut)
    ?.map((b: any) => b.player?._id?.toString() || b.player?.toString());
  const activeStrikerId = currentInnings?.currentStriker?._id?.toString();
  const activeNonStrikerId = currentInnings?.currentNonStriker?._id?.toString();

  const availableBatters = (battingSquad || []).filter(
    (p: any) =>
      !outPlayerIds?.includes(p._id?.toString()) &&
      p._id?.toString() !== activeStrikerId &&
      p._id?.toString() !== activeNonStrikerId
  );

  const crr = calculateRunRate(currentInnings?.totalRuns || 0, currentInnings?.legalBalls || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/matches"
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Matches Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href={`/display/${matchId}`}
            target="_blank"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV Display</span>
          </Link>
          <Link
            href={`/live/${matchId}`}
            target="_blank"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Center</span>
          </Link>
        </div>
      </div>

      {/* Match Completed Banner */}
      {isCompleted && (
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/50 rounded-2xl text-center space-y-2 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">MATCH CONCLUDED</h2>
          <p className="text-sm font-bold text-emerald-400">{match.result?.summary}</p>
          <p className="text-xs text-slate-400">
            Final Scores: {match.teamA?.shortName} {match.summary?.teamAScore?.runs}/{match.summary?.teamAScore?.wickets} vs{" "}
            {match.teamB?.shortName} {match.summary?.teamBScore?.runs}/{match.summary?.teamBScore?.wickets}
          </p>
        </div>
      )}

      {/* Primary Score HUD */}
      {currentInnings && (
        <div className="bg-[#0b1222] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Status pill */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400 uppercase tracking-wider">
                {match.status.replace("_", " ")} • INNINGS {currentInnings.inningsNumber}
              </span>
            </div>
            <span className="text-slate-400 font-medium">
              CRR: <strong className="text-white font-mono">{crr}</strong>
              {currentInnings.target && (
                <span className="ml-3 text-amber-400">
                  Target: <strong>{currentInnings.target}</strong>
                </span>
              )}
            </span>
          </div>

          {/* Main Score & Overs Display */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {currentInnings.battingTeam?.name} Batting
              </p>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tight font-mono">
                  {currentInnings.totalRuns}/{currentInnings.totalWickets}
                </span>
                <span className="text-lg sm:text-2xl font-bold text-slate-400 font-mono">
                  ({formatOvers(currentInnings.legalBalls)} / {match.overs} ov)
                </span>
              </div>
            </div>

            {/* Extras breakdown */}
            <div className="text-right text-xs text-slate-400 space-y-0.5 self-start sm:self-auto">
              <p>
                Extras: <strong className="text-slate-200">{currentInnings.extras?.total || 0}</strong>{" "}
                (w {currentInnings.extras?.wides || 0}, nb {currentInnings.extras?.noBalls || 0}, b {currentInnings.extras?.byes || 0}, lb {currentInnings.extras?.legByes || 0})
              </p>
              <p>Bowling: <strong className="text-slate-200">{currentInnings.bowlingTeam?.name}</strong></p>
            </div>
          </div>

          {/* Active Batsmen & Bowler Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-2">
            {/* Batters */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Batsmen at Crease
              </span>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                  <span className="font-bold text-white">
                    {currentInnings.currentStriker?.name || "Striker"} *
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {currentStrikerScore?.runs ?? 0} ({currentStrikerScore?.balls ?? 0}b • {currentStrikerScore?.fours ?? 0}x4 {currentStrikerScore?.sixes ?? 0}x6)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span className="font-semibold text-slate-300">
                    {currentInnings.currentNonStriker?.name || "Non-striker"}
                  </span>
                </div>
                <span className="font-mono text-slate-400">
                  {currentNonStrikerScore?.runs ?? 0} ({currentNonStrikerScore?.balls ?? 0}b • {currentNonStrikerScore?.fours ?? 0}x4 {currentNonStrikerScore?.sixes ?? 0}x6)
                </span>
              </div>
            </div>

            {/* Bowler */}
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Bowler
                  </span>
                  <button
                    onClick={() => setShowBowlerModal(true)}
                    className="text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    Change Bowler
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {currentInnings.currentBowler?.name || "Bowler"}
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {currentBowlerFigure ? formatOvers(currentBowlerFigure.legalBalls) : "0.0"} -{" "}
                    {currentBowlerFigure?.maidens ?? 0} - {currentBowlerFigure?.runsConceded ?? 0} -{" "}
                    {currentBowlerFigure?.wickets ?? 0}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                <span>Econ: {currentBowlerFigure?.economy ?? 0}</span>
                <span>Wides: {currentBowlerFigure?.wides ?? 0} • NB: {currentBowlerFigure?.noBalls ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Last Balls Ribbon */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Recent:
            </span>
            <div className="flex items-center space-x-1.5">
              {recentDeliveries.slice(0, 10).map((d: any, idx: number) => {
                let badgeClass = "bg-slate-800 text-slate-200 border-slate-700";
                let text = `${d.totalRuns}`;

                if (d.wicket?.isWicket) {
                  badgeClass = "bg-red-600 text-white border-red-500 font-black animate-bounce";
                  text = "W";
                } else if (d.runsBatter === 6) {
                  badgeClass = "bg-purple-600 text-white border-purple-500 font-extrabold";
                  text = "6";
                } else if (d.runsBatter === 4) {
                  badgeClass = "bg-blue-600 text-white border-blue-500 font-extrabold";
                  text = "4";
                } else if (d.extras?.type === "wide") {
                  badgeClass = "bg-amber-600 text-white border-amber-500";
                  text = `Wd${d.totalRuns > 1 ? d.totalRuns : ""}`;
                } else if (d.extras?.type === "no_ball") {
                  badgeClass = "bg-orange-600 text-white border-orange-500";
                  text = "Nb";
                } else if (d.totalRuns === 0) {
                  text = "•";
                  badgeClass = "bg-slate-900 text-slate-500 border-slate-800";
                }

                return (
                  <span
                    key={d._id || idx}
                    className={`w-7 h-7 rounded-lg border text-xs font-mono font-bold flex items-center justify-center ${badgeClass}`}
                  >
                    {text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Scoring Keypad */}
      {isMatchLive && !isCompleted && (
        <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Scorer Keypad
            </h3>
            <button
              onClick={handleUndo}
              disabled={actionLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>
          </div>

          {/* Primary Runs Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {[0, 1, 2, 3, 4, 5, 6].map((run) => (
              <button
                key={run}
                disabled={actionLoading}
                onClick={() =>
                  submitBall({
                    runsBatter: run,
                    extraType: "none",
                    extraRuns: 0,
                  })
                }
                className={`h-16 sm:h-20 rounded-2xl font-black text-2xl transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center ${
                  run === 0
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    : run === 4
                    ? "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-blue-500/20"
                    : run === 6
                    ? "bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 shadow-purple-500/20"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 shadow-emerald-500/20"
                }`}
              >
                <span>{run === 0 ? "•" : run}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  {run === 0 ? "Dot" : run === 4 ? "Four" : run === 6 ? "Six" : "Runs"}
                </span>
              </button>
            ))}
          </div>

          {/* Extras and Wickets Row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800">
            {/* Wide */}
            <button
              disabled={actionLoading}
              onClick={() =>
                submitBall({
                  runsBatter: 0,
                  extraType: "wide",
                  extraRuns: 1,
                })
              }
              className="py-3.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-sm font-extrabold font-mono">WD + 1</span>
              <span className="text-[10px] text-amber-400/80">Wide</span>
            </button>

            {/* No Ball */}
            <button
              disabled={actionLoading}
              onClick={() =>
                submitBall({
                  runsBatter: 0,
                  extraType: "no_ball",
                  extraRuns: 1,
                })
              }
              className="py-3.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 font-bold text-xs rounded-xl border border-orange-500/30 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-sm font-extrabold font-mono">NB + 1</span>
              <span className="text-[10px] text-orange-400/80">No Ball</span>
            </button>

            {/* Bye */}
            <button
              disabled={actionLoading}
              onClick={() =>
                submitBall({
                  runsBatter: 0,
                  extraType: "bye",
                  extraRuns: 1,
                })
              }
              className="py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-sm font-extrabold font-mono">1 Bye</span>
              <span className="text-[10px] text-slate-400">Extras</span>
            </button>

            {/* Leg Bye */}
            <button
              disabled={actionLoading}
              onClick={() =>
                submitBall({
                  runsBatter: 0,
                  extraType: "leg_bye",
                  extraRuns: 1,
                })
              }
              className="py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-sm font-extrabold font-mono">1 Leg Bye</span>
              <span className="text-[10px] text-slate-400">Extras</span>
            </button>

            {/* Switch Strike */}
            <button
              disabled={actionLoading}
              onClick={() =>
                submitBall({
                  runsBatter: 1,
                  extraType: "none",
                  extraRuns: 0,
                })
              }
              className="py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-sm font-extrabold font-mono">Strike</span>
              <span className="text-[10px] text-slate-400">Rotate</span>
            </button>

            {/* WICKET BUTTON (Highlighted Red) */}
            <button
              disabled={actionLoading}
              onClick={() => setShowWicketModal(true)}
              className="py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl border border-red-400 shadow-lg shadow-red-600/30 transition-all flex flex-col items-center justify-center col-span-3 sm:col-span-1 active:scale-95"
            >
              <span className="text-sm font-black tracking-wider">WICKET!</span>
              <span className="text-[10px] uppercase opacity-90">Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Toss & Match Initiation Modal */}
      {showTossModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleStartMatch}
            className="w-full max-w-lg bg-[#0d1424] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative"
          >
            <div className="text-center space-y-1">
              <span className="text-2xl">🏏</span>
              <h2 className="text-xl font-black text-white">Pre-Match Toss & Playing Setup</h2>
              <p className="text-xs text-slate-400">Record toss winner, decision, and opening players</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Toss Winner
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[match.teamA, match.teamB].filter(Boolean).map((t: any) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setTossWinner(t._id)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      tossWinner === t._id
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Elected To
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["bat", "bowl"].map((decision) => (
                  <button
                    key={decision}
                    type="button"
                    onClick={() => setTossDecision(decision as any)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs uppercase tracking-wider transition-all ${
                      tossDecision === decision
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {decision === "bat" ? "🏏 Bat First" : "⚾ Bowl First"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Opening Striker (*)
                </label>
                <select
                  required
                  value={openingStriker}
                  onChange={(e) => setOpeningStriker(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">-- Choose Striker --</option>
                  {(tossDecision === "bat"
                    ? tossWinner === match.teamA._id
                      ? squads?.teamA
                      : squads?.teamB
                    : tossWinner === match.teamA._id
                    ? squads?.teamB
                    : squads?.teamA
                  )?.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Opening Non-Striker
                </label>
                <select
                  required
                  value={openingNonStriker}
                  onChange={(e) => setOpeningNonStriker(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">-- Choose Non-Striker --</option>
                  {(tossDecision === "bat"
                    ? tossWinner === match.teamA._id
                      ? squads?.teamA
                      : squads?.teamB
                    : tossWinner === match.teamA._id
                    ? squads?.teamB
                    : squads?.teamA
                  )?.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Opening Bowler
              </label>
              <select
                required
                value={openingBowler}
                onChange={(e) => setOpeningBowler(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="">-- Choose Opening Bowler --</option>
                {(tossDecision === "bowl"
                  ? tossWinner === match.teamA._id
                    ? squads?.teamA
                    : squads?.teamB
                  : tossWinner === match.teamA._id
                  ? squads?.teamB
                  : squads?.teamA
                )?.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.bowlingStyle?.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !tossWinner || !openingStriker || !openingBowler}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              {actionLoading ? "Starting Match..." : "Start Match Live 🔴"}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: Wicket Details Modal */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmWicket}
            className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <span className="text-red-500">🔴</span>
                <span>Fall of Wicket Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWicketModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Dismissal Type
              </label>
              <select
                value={wicketType}
                onChange={(e) => setWicketType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs capitalize"
              >
                <option value="caught">Caught</option>
                <option value="bowled">Bowled</option>
                <option value="lbw">LBW</option>
                <option value="run_out">Run Out</option>
                <option value="stumped">Stumped</option>
                <option value="hit_wicket">Hit Wicket</option>
                <option value="retired_out">Retired Out</option>
              </select>
            </div>

            {/* Dismissed Batter selection (especially critical for run out) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Batter Dismissed
              </label>
              <select
                value={dismissedBatterId}
                onChange={(e) => setDismissedBatterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value={currentInnings.currentStriker?._id}>
                  {currentInnings.currentStriker?.name} (Striker)
                </option>
                <option value={currentInnings.currentNonStriker?._id}>
                  {currentInnings.currentNonStriker?.name} (Non-Striker)
                </option>
              </select>
            </div>

            {/* Fielder if caught / run out / stumped */}
            {["caught", "run_out", "stumped"].includes(wicketType) && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Fielder / Wicketkeeper Involved
                </label>
                <select
                  value={fielderId}
                  onChange={(e) => setFielderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">-- Bowler / Unassisted --</option>
                  {bowlingSquad?.map((f: any) => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Incoming next batsman */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                Next Incoming Batsman
              </label>
              <select
                value={incomingBatterId}
                onChange={(e) => setIncomingBatterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/50 rounded-xl text-white text-xs"
              >
                <option value="">-- Choose incoming batter --</option>
                {availableBatters.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.role?.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
            >
              Confirm Wicket
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: Bowler Change Modal */}
      {showBowlerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmBowler}
            className="w-full max-w-sm bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <span className="text-2xl">⚾</span>
              <h3 className="font-bold text-white text-base">Select Next Bowler</h3>
              <p className="text-xs text-slate-400">Over completed. Choose the bowler for the next over.</p>
            </div>

            <div>
              <select
                required
                value={nextBowlerId}
                onChange={(e) => setNextBowlerId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="">-- Choose Bowler --</option>
                {bowlingSquad?.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.bowlingStyle?.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!nextBowlerId}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Confirm Bowler
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

