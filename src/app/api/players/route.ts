import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Player from "@/models/Player";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (role) {
      query.role = role;
    }

    const players = await Player.find(query)
      .populate("currentTeam", "name shortName logo")
      .sort({ name: 1 });

    return NextResponse.json({ players });
  } catch (error: any) {
    console.error("Fetch Players Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const {
      name,
      role = "all_rounder",
      battingStyle = "right_hand",
      bowlingStyle = "right_arm_medium",
      jerseyNumber,
      age,
      avatar,
      currentTeamId,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Player name is required." }, { status: 400 });
    }

    const player = await Player.create({
      name: name.trim(),
      role,
      battingStyle,
      bowlingStyle,
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : 0,
      age: age ? Number(age) : undefined,
      avatar: avatar || "",
      currentTeam: currentTeamId || undefined,
      organizer: user?.userId,
    });

    return NextResponse.json({ player }, { status: 201 });
  } catch (error: any) {
    console.error("Create Player Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create player" }, { status: 500 });
  }
}
