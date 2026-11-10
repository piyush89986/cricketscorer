import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Player from "@/models/Player";
import Innings from "@/models/Innings";
import Match from "@/models/Match";
import Team from "@/models/Team";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid player ID format" }, { status: 404 });
    }

    const player = await Player.findById(id).populate("currentTeam", "name shortName logo");
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Aggregate player batting stats across all innings
    const inningsBatting = await Innings.find({
      "battingScorecard.player": id,
    }).populate("match", "matchNumber date venue status");

    let matchesPlayedSet = new Set<string>();
    let inningsBatted = 0;
    let runs = 0;
    let balls = 0;
    let fours = 0;
    let sixes = 0;
    let highestScore = 0;
    let fifties = 0;
    let hundreds = 0;
    let notOuts = 0;

    for (const inn of inningsBatting) {
      if (inn.match) matchesPlayedSet.add((inn.match as any)._id.toString());
      const bEntry = inn.battingScorecard.find((b) => b.player.toString() === id);
      if (bEntry) {
        inningsBatted += 1;
        runs += bEntry.runs;
        balls += bEntry.balls;
        fours += bEntry.fours;
        sixes += bEntry.sixes;
        if (bEntry.runs > highestScore) highestScore = bEntry.runs;
        if (bEntry.runs >= 100) hundreds += 1;
        else if (bEntry.runs >= 50) fifties += 1;
        if (!bEntry.isOut) notOuts += 1;
      }
    }

    const dismissals = inningsBatted - notOuts;
    const battingAverage = dismissals > 0 ? parseFloat((runs / dismissals).toFixed(2)) : runs;
    const strikeRate = balls > 0 ? parseFloat(((runs / balls) * 100).toFixed(2)) : 0;

    // Aggregate player bowling stats
    const inningsBowling = await Innings.find({
      "bowlingScorecard.player": id,
    });

    let legalBalls = 0;
    let runsConceded = 0;
    let wickets = 0;
    let maidens = 0;
    let bestBowlingWickets = 0;
    let bestBowlingRuns = 999;

    for (const inn of inningsBowling) {
      if (inn.match) matchesPlayedSet.add(inn.match.toString());
      const bowlEntry = inn.bowlingScorecard.find((b) => b.player.toString() === id);
      if (bowlEntry) {
        legalBalls += bowlEntry.legalBalls;
        runsConceded += bowlEntry.runsConceded;
        wickets += bowlEntry.wickets;
        maidens += bowlEntry.maidens;
        if (
          bowlEntry.wickets > bestBowlingWickets ||
          (bowlEntry.wickets === bestBowlingWickets && bowlEntry.runsConceded < bestBowlingRuns)
        ) {
          bestBowlingWickets = bowlEntry.wickets;
          bestBowlingRuns = bowlEntry.runsConceded;
        }
      }
    }

    const oversBowled = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
    const economy = legalBalls > 0 ? parseFloat(((runsConceded / legalBalls) * 6).toFixed(2)) : 0;
    const bowlingAverage = wickets > 0 ? parseFloat((runsConceded / wickets).toFixed(2)) : 0;
    const bestBowling = bestBowlingWickets > 0 ? `${bestBowlingWickets}/${bestBowlingRuns}` : "-";

    return NextResponse.json({
      player,
      stats: {
        matches: matchesPlayedSet.size || 1,
        batting: {
          innings: inningsBatted,
          runs,
          balls,
          highestScore,
          average: battingAverage,
          strikeRate,
          fours,
          sixes,
          fifties,
          hundreds,
          notOuts,
        },
        bowling: {
          overs: oversBowled,
          legalBalls,
          runsConceded,
          wickets,
          maidens,
          economy,
          average: bowlingAverage,
          bestBowling,
        },
      },
    });
  } catch (error: any) {
    console.error("Player Stats Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch player stats" }, { status: 500 });
  }
}

