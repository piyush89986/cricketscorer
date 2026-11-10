import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Match from "@/models/Match";
import TournamentStanding from "@/models/TournamentStanding";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireRole(req, ["organizer", "super_admin"]);
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { teamIds, clearExisting = false } = body;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (!teamIds || teamIds.length < 2) {
      return NextResponse.json({ error: "At least 2 teams are required to generate fixtures." }, { status: 400 });
    }

    if (clearExisting) {
      await Match.deleteMany({ tournament: id, status: "upcoming" });
    }

    // Ensure TournamentStanding records exist for each team
    for (const teamId of teamIds) {
      await TournamentStanding.findOneAndUpdate(
        { tournament: id, team: teamId },
        {
          $setOnInsert: {
            tournament: id,
            team: teamId,
            played: 0,
            won: 0,
            lost: 0,
            tied: 0,
            noResult: 0,
            points: 0,
            runsScored: 0,
            oversFacedLegalBalls: 0,
            runsConceded: 0,
            oversBowledLegalBalls: 0,
            netRunRate: 0,
          },
        },
        { upsert: true }
      );
    }

    const createdMatches = [];
    let matchNumber = (await Match.countDocuments({ tournament: id })) + 1;
    let baseDate = new Date(tournament.startDate);

    // Generate Round Robin pairings
    if (tournament.format === "round_robin" || tournament.format === "group_knockout") {
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          const matchDate = new Date(baseDate.getTime() + (matchNumber - 1) * 24 * 60 * 60 * 1000);
          const match = await Match.create({
            tournament: id,
            matchNumber,
            stage: "League Stage",
            teamA: teamIds[i],
            teamB: teamIds[j],
            venue: tournament.venue,
            date: matchDate,
            time: matchNumber % 2 === 1 ? "02:00 PM" : "07:30 PM",
            overs: tournament.overs,
            status: "upcoming",
            summary: {
              teamAScore: { runs: 0, wickets: 0, legalBalls: 0 },
              teamBScore: { runs: 0, wickets: 0, legalBalls: 0 },
            },
          });
          createdMatches.push(match);
          matchNumber++;
        }
      }
    } else if (tournament.format === "single_elimination") {
      // Knockout bracket round 1
      for (let i = 0; i < teamIds.length; i += 2) {
        if (i + 1 < teamIds.length) {
          const matchDate = new Date(baseDate.getTime() + Math.floor(i / 2) * 24 * 60 * 60 * 1000);
          const match = await Match.create({
            tournament: id,
            matchNumber,
            stage: teamIds.length <= 4 ? "Semi Final" : "Quarter Final",
            teamA: teamIds[i],
            teamB: teamIds[i + 1],
            venue: tournament.venue,
            date: matchDate,
            time: "03:00 PM",
            overs: tournament.overs,
            status: "upcoming",
          });
          createdMatches.push(match);
          matchNumber++;
        }
      }
    }

    tournament.status = "ongoing";
    await tournament.save();

    return NextResponse.json({
      message: `Successfully generated ${createdMatches.length} fixtures!`,
      matches: createdMatches,
    });
  } catch (error: any) {
    console.error("Fixture Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate fixtures" }, { status: 500 });
  }
}

