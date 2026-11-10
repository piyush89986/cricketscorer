import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Tournament from "@/models/Tournament";
import TeamPlayer from "@/models/TeamPlayer";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const match = await Match.findById(id)
      .populate("tournament")
      .populate("teamA")
      .populate("teamB")
      .populate("toss.winner", "name shortName")
      .populate("captain.teamA", "name jerseyNumber")
      .populate("captain.teamB", "name jerseyNumber")
      .populate("wicketKeeper.teamA", "name jerseyNumber")
      .populate("wicketKeeper.teamB", "name jerseyNumber")
      .populate("result.winner", "name shortName")
      .populate("result.playerOfTheMatch", "name");

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Fetch innings with populated players
    const inningsList = await Innings.find({ match: id })
      .populate("battingTeam", "name shortName logo primaryColor")
      .populate("bowlingTeam", "name shortName logo primaryColor")
      .populate("currentStriker", "name jerseyNumber role battingStyle")
      .populate("currentNonStriker", "name jerseyNumber role battingStyle")
      .populate("currentBowler", "name jerseyNumber role bowlingStyle")
      .populate("battingScorecard.player", "name jerseyNumber role")
      .populate("battingScorecard.bowler", "name")
      .populate("battingScorecard.fielder", "name")
      .populate("bowlingScorecard.player", "name jerseyNumber role bowlingStyle")
      .populate("fallOfWickets.player", "name jerseyNumber");

    // Fetch recent deliveries (last 24)
    const recentDeliveries = await Delivery.find({ match: id, isUndone: false })
      .populate("striker", "name")
      .populate("nonStriker", "name")
      .populate("bowler", "name")
      .populate("wicket.playerDismissed", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    // Fetch squads for both teams
    const teamAPlayers = await TeamPlayer.find({ team: match.teamA._id }).populate("player");
    const teamBPlayers = await TeamPlayer.find({ team: match.teamB._id }).populate("player");

    return NextResponse.json({
      match,
      inningsList,
      currentInnings: inningsList.find((i) => i.inningsNumber === match.currentInnings) || inningsList[0] || null,
      recentDeliveries,
      squads: {
        teamA: teamAPlayers.map((tp: any) => tp.player).filter(Boolean),
        teamB: teamBPlayers.map((tp: any) => tp.player).filter(Boolean),
      },
    });
  } catch (error: any) {
    console.error("Match Detail API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch match details" }, { status: 500 });
  }
}

