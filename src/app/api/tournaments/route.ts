import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status) query.status = status;

    const tournaments = await Tournament.find(query)
      .populate("organizer", "name email organization")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tournaments });
  } catch (error: any) {
    console.error("Fetch Tournaments Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tournaments" }, { status: 500 });
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
      description,
      venue,
      startDate,
      endDate,
      format = "round_robin",
      overs = 20,
      ballType = "leather",
      maxTeams = 8,
      rules,
      logo,
    } = body;

    if (!name || !venue || !startDate || !endDate) {
      return NextResponse.json({ error: "Name, venue, start date, and end date are required." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const tournament = await Tournament.create({
      name: name.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      organizer: user?.userId,
      description: description || "",
      venue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      format,
      overs: Number(overs),
      ballType,
      maxTeams: Number(maxTeams),
      rules: {
        pointsWin: rules?.pointsWin ?? 2,
        pointsTie: rules?.pointsTie ?? 1,
        pointsLoss: rules?.pointsLoss ?? 0,
        pointsNR: rules?.pointsNR ?? 1,
      },
      status: "registration",
      logo: logo || "",
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error: any) {
    console.error("Create Tournament Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create tournament" }, { status: 500 });
  }
}
