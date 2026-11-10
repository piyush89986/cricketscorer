import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import { requireRole } from "@/lib/auth";
import { emitMatchUpdate } from "@/lib/socket";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "scorer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const {
      tossWinnerId,
      tossDecision, // 'bat' or 'bowl'
      playingXI_teamA,
      playingXI_teamB,
      strikerId,
      nonStrikerId,
      openingBowlerId,
    } = body;

    const match = await Match.findById(id);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (!tossWinnerId || !tossDecision) {
      return NextResponse.json({ error: "Toss winner and decision are required." }, { status: 400 });
    }

    // Determine who bats first
    let battingTeamId: any;
    let bowlingTeamId: any;

    if (tossDecision === "bat") {
      battingTeamId = tossWinnerId;
      bowlingTeamId = match.teamA.toString() === tossWinnerId ? match.teamB : match.teamA;
    } else {
      bowlingTeamId = tossWinnerId;
      battingTeamId = match.teamA.toString() === tossWinnerId ? match.teamB : match.teamA;
    }

    match.toss = {
      winner: tossWinnerId,
      decision: tossDecision,
    };

    if (playingXI_teamA && playingXI_teamA.length > 0) {
      match.playingXI.teamA = playingXI_teamA;
    }
    if (playingXI_teamB && playingXI_teamB.length > 0) {
      match.playingXI.teamB = playingXI_teamB;
    }

    // Initialize 1st Innings
    let innings1 = await Innings.findOne({ match: match._id, inningsNumber: 1 });
    if (!innings1) {
      innings1 = await Innings.create({
        match: match._id,
        inningsNumber: 1,
        battingTeam: battingTeamId,
        bowlingTeam: bowlingTeamId,
        totalRuns: 0,
        totalWickets: 0,
        legalBalls: 0,
        status: "in_progress",
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
        fallOfWickets: [],
        battingScorecard: [
          ...(strikerId
            ? [
                {
                  player: strikerId,
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  strikeRate: 0,
                  isOut: false,
                  dismissalText: "not out",
                  battingOrder: 1,
                  isCurrentStriker: true,
                  isCurrentNonStriker: false,
                },
              ]
            : []),
          ...(nonStrikerId
            ? [
                {
                  player: nonStrikerId,
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  strikeRate: 0,
                  isOut: false,
                  dismissalText: "not out",
                  battingOrder: 2,
                  isCurrentStriker: false,
                  isCurrentNonStriker: true,
                },
              ]
            : []),
        ],
        bowlingScorecard: openingBowlerId
          ? [
              {
                player: openingBowlerId,
                legalBalls: 0,
                maidens: 0,
                runsConceded: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0,
                economy: 0,
                isCurrentBowler: true,
              },
            ]
          : [],
        currentStriker: strikerId || undefined,
        currentNonStriker: nonStrikerId || undefined,
        currentBowler: openingBowlerId || undefined,
      });

      match.inningsList = [innings1._id];
    }

    match.status = "live";
    match.currentInnings = 1;
    await match.save();

    emitMatchUpdate(id, "match-started", { match, innings: innings1 });

    return NextResponse.json({
      message: "Toss recorded and match started live successfully!",
      match,
      innings: innings1,
    });
  } catch (error: any) {
    console.error("Toss Recording Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record toss" }, { status: 500 });
  }
}
