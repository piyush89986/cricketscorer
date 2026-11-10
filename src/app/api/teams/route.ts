import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import TeamPlayer from "@/models/TeamPlayer";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const teams = await Team.find()
      .populate("captain", "name jerseyNumber role")
      .populate("wicketkeeper", "name jerseyNumber")
      .populate("organizer", "name")
      .sort({ name: 1 });

    return NextResponse.json({ teams });
  } catch (error: any) {
    console.error("Fetch Teams Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const { name, shortName, city, logo, primaryColor, secondaryColor } = body;

    if (!name || !shortName) {
      return NextResponse.json({ error: "Team name and short name are required." }, { status: 400 });
    }

    const team = await Team.create({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      city: city || "",
      logo: logo || "",
      primaryColor: primaryColor || "#16a34a",
      secondaryColor: secondaryColor || "#0f172a",
      organizer: user?.userId,
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    console.error("Create Team Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create team" }, { status: 500 });
  }
}
