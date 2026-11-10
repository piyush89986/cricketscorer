import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ScoringService } from "@/services/scoring.service";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "scorer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const result = await ScoringService.recordDelivery({
      ...body,
      matchId: id,
      scorerId: user?.userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Ball Scoring Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record delivery" }, { status: 400 });
  }
}

