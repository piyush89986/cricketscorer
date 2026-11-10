import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TournamentStanding from "@/models/TournamentStanding";
import Match from "@/models/Match";
import { updateTournamentStandingsAfterMatch } from "@/services/nrr.service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Fetch latest standings sorted by points (descending) then netRunRate (descending)
    const standings = await TournamentStanding.find({ tournament: id })
      .populate("team", "name shortName logo primaryColor")
      .sort({ points: -1, netRunRate: -1, won: -1 });

    return NextResponse.json({ standings });
  } catch (error: any) {
    console.error("Standings API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch standings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Find any completed match to trigger a fresh recalculation
    const completedMatch = await Match.findOne({ tournament: id, status: "completed" });
    if (completedMatch) {
      await updateTournamentStandingsAfterMatch(completedMatch._id.toString());
    }

    const standings = await TournamentStanding.find({ tournament: id })
      .populate("team", "name shortName logo primaryColor")
      .sort({ points: -1, netRunRate: -1 });

    return NextResponse.json({ message: "Standings recalculated successfully", standings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to recalculate standings" }, { status: 500 });
  }
}
