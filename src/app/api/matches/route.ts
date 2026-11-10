import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const filter: any = {};
    if (tournamentId) filter.tournament = tournamentId;
    if (status) {
      if (status === "live") {
        filter.status = { $in: ["live", "innings_break"] };
      } else {
        filter.status = status;
      }
    }

    const matches = await Match.find(filter)
      .populate("tournament", "name slug venue overs")
      .populate("teamA", "name shortName logo primaryColor")
      .populate("teamB", "name shortName logo primaryColor")
      .populate("result.winner", "name shortName")
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("Fetch Matches Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const {
      tournamentId,
      teamAId,
      teamBId,
      venue,
      date,
      time,
      overs,
      stage = "League Match",
      assignedScorerId,
      assignedUmpire,
    } = body;

    if (!tournamentId || !teamAId || !teamBId) {
      return NextResponse.json({ error: "Tournament, Team A, and Team B are required." }, { status: 400 });
    }

    if (teamAId === teamBId) {
      return NextResponse.json({ error: "Team A and Team B cannot be the same team." }, { status: 400 });
    }

    // Determine next match number
    const matchCount = await Match.countDocuments({ tournament: tournamentId });
    const matchNumber = matchCount + 1;

    const match = await Match.create({
      tournament: tournamentId,
      matchNumber,
      stage,
      teamA: teamAId,
      teamB: teamBId,
      venue: venue || "Main Ground",
      date: date ? new Date(date) : new Date(),
      time: time || "10:00 AM",
      overs: overs ? Number(overs) : 20,
      status: "upcoming",
      assignedScorer: assignedScorerId || user?.userId,
      assignedUmpire: assignedUmpire || "Official Umpire",
      summary: {
        teamAScore: { runs: 0, wickets: 0, legalBalls: 0 },
        teamBScore: { runs: 0, wickets: 0, legalBalls: 0 },
      },
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("tournament", "name venue")
      .populate("teamA", "name shortName logo")
      .populate("teamB", "name shortName logo");

    return NextResponse.json({ match: populatedMatch }, { status: 201 });
  } catch (error: any) {
    console.error("Create Match Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create match" }, { status: 500 });
  }
}

