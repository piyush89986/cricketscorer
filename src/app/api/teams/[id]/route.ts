import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import TeamPlayer from "@/models/TeamPlayer";
import Match from "@/models/Match";
import User from "@/models/User";
import Player from "@/models/Player";
import Tournament from "@/models/Tournament";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid team ID format" }, { status: 404 });
    }

    const team = await Team.findById(id)
      .populate("captain", "name jerseyNumber role")
      .populate("wicketkeeper", "name jerseyNumber")
      .populate("organizer", "name organization");

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const squadRecords = await TeamPlayer.find({ team: id })
      .populate("player")
      .sort({ jerseyNumber: 1 });

    const matches = await Match.find({
      $or: [{ teamA: id }, { teamB: id }],
    })
      .populate("tournament", "name")
      .populate("teamA", "name shortName logo")
      .populate("teamB", "name shortName logo")
      .populate("result.winner", "name shortName")
      .sort({ date: -1 });

    return NextResponse.json({
      team,
      squad: squadRecords.map((sr) => sr.player).filter(Boolean),
      squadDetails: squadRecords,
      matches,
    });
  } catch (error: any) {
    console.error("Team Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch team details" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid team ID format" }, { status: 404 });
    }

    const body = await req.json();

    const team = await Team.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update team" }, { status: 500 });
  }
}

