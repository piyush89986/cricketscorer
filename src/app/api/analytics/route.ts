import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Match from "@/models/Match";
import Innings from "@/models/Innings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");

    const matchFilter: any = {};
    if (tournamentId) matchFilter.tournament = tournamentId;

    const [
      totalTournaments,
      activeTournaments,
      totalTeams,
      totalPlayers,
      totalMatches,
      liveMatches,
      upcomingMatches,
      completedMatches,
    ] = await Promise.all([
      Tournament.countDocuments(),
      Tournament.countDocuments({ status: "ongoing" }),
      Team.countDocuments(),
      Player.countDocuments(),
      Match.countDocuments(matchFilter),
      Match.countDocuments({ ...matchFilter, status: { $in: ["live", "innings_break"] } }),
      Match.countDocuments({ ...matchFilter, status: "upcoming" }),
      Match.countDocuments({ ...matchFilter, status: "completed" }),
    ]);

    // Aggregate all completed and live innings
    const inningsList = await Innings.find(
      tournamentId ? { match: { $in: await Match.find({ tournament: tournamentId }).distinct("_id") } } : {}
    );

    let totalRuns = 0;
    let totalWickets = 0;
    let highestScore = 0;

    // Player leaderboard aggregates
    const batterMap: Record<string, { id: string; name: string; runs: number; balls: number; fours: number; sixes: number }> = {};
    const bowlerMap: Record<string, { id: string; name: string; wickets: number; runsConceded: number; legalBalls: number }> = {};

    for (const inn of inningsList) {
      totalRuns += inn.totalRuns;
      totalWickets += inn.totalWickets;
      if (inn.totalRuns > highestScore) highestScore = inn.totalRuns;

      for (const b of inn.battingScorecard) {
        const pId = b.player.toString();
        if (!batterMap[pId]) {
          batterMap[pId] = { id: pId, name: "", runs: 0, balls: 0, fours: 0, sixes: 0 };
        }
        batterMap[pId].runs += b.runs;
        batterMap[pId].balls += b.balls;
        batterMap[pId].fours += b.fours;
        batterMap[pId].sixes += b.sixes;
      }

      for (const bowl of inn.bowlingScorecard) {
        const pId = bowl.player.toString();
        if (!bowlerMap[pId]) {
          bowlerMap[pId] = { id: pId, name: "", wickets: 0, runsConceded: 0, legalBalls: 0 };
        }
        bowlerMap[pId].wickets += bowl.wickets;
        bowlerMap[pId].runsConceded += bowl.runsConceded;
        bowlerMap[pId].legalBalls += bowl.legalBalls;
      }
    }

    // Populate player names for leaders
    const playerIds = [
      ...Object.keys(batterMap),
      ...Object.keys(bowlerMap),
    ];
    const players = await Player.find({ _id: { $in: playerIds } }).select("name role currentTeam");
    const playerNameMap: Record<string, string> = {};
    players.forEach((p) => {
      playerNameMap[p._id.toString()] = p.name;
    });

    // Top run scorers
    const topRunScorers = Object.values(batterMap)
      .map((b) => ({
        ...b,
        name: playerNameMap[b.id] || "Unknown Batter",
        strikeRate: b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);

    // Top wicket takers
    const topWicketTakers = Object.values(bowlerMap)
      .map((b) => ({
        ...b,
        name: playerNameMap[b.id] || "Unknown Bowler",
        overs: `${Math.floor(b.legalBalls / 6)}.${b.legalBalls % 6}`,
        economy: b.legalBalls > 0 ? parseFloat(((b.runsConceded / b.legalBalls) * 6).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 5);

    const averageRunsPerMatch =
      completedMatches + liveMatches > 0
        ? Math.round(totalRuns / (completedMatches + liveMatches))
        : 0;

    return NextResponse.json({
      metrics: {
        totalTournaments,
        activeTournaments,
        totalTeams,
        totalPlayers,
        totalMatches,
        liveMatches,
        upcomingMatches,
        completedMatches,
        totalRuns,
        totalWickets,
        averageRunsPerMatch,
        highestScore,
      },
      leaderboards: {
        topRunScorers,
        topWicketTakers,
      },
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
