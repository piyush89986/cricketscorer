import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import TournamentStanding from "@/models/TournamentStanding";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const tournament = await Tournament.findById(id).populate("organizer", "name email organization");
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const matches = await Match.find({ tournament: id })
      .populate("teamA", "name shortName logo primaryColor")
      .populate("teamB", "name shortName logo primaryColor")
      .populate("result.winner", "name shortName")
      .sort({ matchNumber: 1 });

    const standings = await TournamentStanding.find({ tournament: id })
      .populate("team", "name shortName logo")
      .sort({ points: -1, netRunRate: -1 });

    return NextResponse.json({
      tournament,
      matches,
      standings,
    });
  } catch (error: any) {
    console.error("Tournament Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tournament" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const tournament = await Tournament.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error: any) {
    console.error("Update Tournament Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update tournament" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;

    await Tournament.findByIdAndDelete(id);
    await Match.deleteMany({ tournament: id });
    await TournamentStanding.deleteMany({ tournament: id });

    return NextResponse.json({ message: "Tournament and associated fixtures deleted successfully" });
  } catch (error: any) {
    console.error("Delete Tournament Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete tournament" }, { status: 500 });
  }
}

