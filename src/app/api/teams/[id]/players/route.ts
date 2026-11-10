import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TeamPlayer from "@/models/TeamPlayer";
import Team from "@/models/Team";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { playerId, isCaptain = false, isWicketKeeper = false, jerseyNumber = 0 } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    const teamPlayer = await TeamPlayer.findOneAndUpdate(
      { team: id, player: playerId },
      { isCaptain, isWicketKeeper, jerseyNumber },
      { upsert: true, new: true }
    ).populate("player");

    if (isCaptain) {
      await Team.findByIdAndUpdate(id, { captain: playerId });
    }
    if (isWicketKeeper) {
      await Team.findByIdAndUpdate(id, { wicketkeeper: playerId });
    }

    return NextResponse.json({ message: "Player added to squad successfully", teamPlayer }, { status: 201 });
  } catch (error: any) {
    console.error("Add Player Error:", error);
    return NextResponse.json({ error: error.message || "Failed to add player to squad" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    await TeamPlayer.findOneAndDelete({ team: id, player: playerId });
    return NextResponse.json({ message: "Player removed from squad" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove player" }, { status: 500 });
  }
}
