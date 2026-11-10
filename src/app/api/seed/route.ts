import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Player from "@/models/Player";
import TeamPlayer from "@/models/TeamPlayer";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";
import TournamentStanding from "@/models/TournamentStanding";

export async function POST() {
  try {
    await connectToDatabase();

    // Check if organizer already exists
    let organizer = await User.findOne({ email: "organizer@cricscore.com" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    if (!organizer) {
      organizer = await User.create({
        name: "Rahul Dravid",
        email: "organizer@cricscore.com",
        password: hashedPassword,
        role: "organizer",
        phone: "+91 9888877777",
        organization: "Premier Cricket Association",
      });
    }

    let scorer = await User.findOne({ email: "scorer@cricscore.com" });
    if (!scorer) {
      scorer = await User.create({
        name: "Anil Kumble (Official Scorer)",
        email: "scorer@cricscore.com",
        password: hashedPassword,
        role: "scorer",
        phone: "+91 9777766666",
        organization: "PCA Scoring Panel",
      });
    }

    let superAdmin = await User.findOne({ email: "admin@cricscore.com" });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: "Super Administrator",
        email: "admin@cricscore.com",
        password: hashedPassword,
        role: "super_admin",
        phone: "+91 9999900000",
        organization: "CricScore Platform HQ",
      });
    }

    // Create Tournament if none exists
    let tournament = await Tournament.findOne({ slug: "premier-t20-champions-league-2026" });
    if (!tournament) {
      tournament = await Tournament.create({
        name: "Premier T20 Champions League 2026",
        slug: "premier-t20-champions-league-2026",
        organizer: organizer._id,
        description: "The grand annual premier league featuring top city franchise teams battling for glory.",
        venue: "Wankhede Stadium, Mumbai",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        format: "round_robin",
        overs: 20,
        ballType: "leather",
        maxTeams: 4,
        rules: {
          pointsWin: 2,
          pointsTie: 1,
          pointsLoss: 0,
          pointsNR: 1,
        },
        status: "ongoing",
        logo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80",
        sponsors: [
          { name: "Apex Energy", logo: "⚡" },
          { name: "Titan Sports", logo: "🏆" },
        ],
      });
    }

    // Create Teams
    const teamData = [
      { name: "Mumbai Strikers", shortName: "MS", city: "Mumbai", primaryColor: "#0284c7" },
      { name: "Bangalore Blasters", shortName: "BB", city: "Bangalore", primaryColor: "#dc2626" },
      { name: "Chennai Kings", shortName: "CK", city: "Chennai", primaryColor: "#eab308" },
      { name: "Delhi Dynamos", shortName: "DD", city: "Delhi", primaryColor: "#2563eb" },
    ];

    const teams: any[] = [];
    for (const t of teamData) {
      let team = await Team.findOne({ name: t.name });
      if (!team) {
        team = await Team.create({
          ...t,
          organizer: organizer._id,
        });
      }
      teams.push(team);
    }

    // Create Players for Mumbai Strikers (Team 0) and Bangalore Blasters (Team 1)
    const mumbaiPlayersData = [
      { name: "Rohit Sharma", role: "batsman", jerseyNumber: 45, battingStyle: "right_hand", bowlingStyle: "right_arm_spin" },
      { name: "Ishan Kishan", role: "wicket_keeper", jerseyNumber: 23, battingStyle: "left_hand", bowlingStyle: "none" },
      { name: "Suryakumar Yadav", role: "batsman", jerseyNumber: 63, battingStyle: "right_hand", bowlingStyle: "right_arm_medium" },
      { name: "Tilak Varma", role: "batsman", jerseyNumber: 9, battingStyle: "left_hand", bowlingStyle: "right_arm_spin" },
      { name: "Hardik Pandya", role: "all_rounder", jerseyNumber: 33, battingStyle: "right_hand", bowlingStyle: "right_arm_fast" },
      { name: "Tim David", role: "batsman", jerseyNumber: 8, battingStyle: "right_hand", bowlingStyle: "right_arm_spin" },
      { name: "Gerald Coetzee", role: "bowler", jerseyNumber: 62, battingStyle: "right_hand", bowlingStyle: "right_arm_fast" },
      { name: "Piyush Chawla", role: "bowler", jerseyNumber: 11, battingStyle: "left_hand", bowlingStyle: "right_arm_spin" },
      { name: "Jasprit Bumrah", role: "bowler", jerseyNumber: 93, battingStyle: "right_hand", bowlingStyle: "right_arm_fast" },
      { name: "Nuwan Thushara", role: "bowler", jerseyNumber: 99, battingStyle: "right_hand", bowlingStyle: "right_arm_medium" },
      { name: "Akash Madhwal", role: "bowler", jerseyNumber: 5, battingStyle: "right_hand", bowlingStyle: "right_arm_medium" },
    ];

    const bangalorePlayersData = [
      { name: "Faf du Plessis", role: "batsman", jerseyNumber: 13, battingStyle: "right_hand", bowlingStyle: "right_arm_medium" },
      { name: "Virat Kohli", role: "batsman", jerseyNumber: 18, battingStyle: "right_hand", bowlingStyle: "right_arm_medium" },
      { name: "Rajat Patidar", role: "batsman", jerseyNumber: 97, battingStyle: "right_hand", bowlingStyle: "right_arm_spin" },
      { name: "Glenn Maxwell", role: "all_rounder", jerseyNumber: 32, battingStyle: "right_hand", bowlingStyle: "right_arm_spin" },
      { name: "Cameron Green", role: "all_rounder", jerseyNumber: 42, battingStyle: "right_hand", bowlingStyle: "right_arm_fast" },
      { name: "Dinesh Karthik", role: "wicket_keeper", jerseyNumber: 19, battingStyle: "right_hand", bowlingStyle: "none" },
      { name: "Mahipal Lomror", role: "all_rounder", jerseyNumber: 6, battingStyle: "left_hand", bowlingStyle: "left_arm_spin" },
      { name: "Swapnil Singh", role: "all_rounder", jerseyNumber: 15, battingStyle: "right_hand", bowlingStyle: "left_arm_spin" },
      { name: "Karn Sharma", role: "bowler", jerseyNumber: 36, battingStyle: "left_hand", bowlingStyle: "right_arm_spin" },
      { name: "Mohammed Siraj", role: "bowler", jerseyNumber: 73, battingStyle: "right_hand", bowlingStyle: "right_arm_fast" },
      { name: "Yash Dayal", role: "bowler", jerseyNumber: 10, battingStyle: "left_hand", bowlingStyle: "left_arm_fast" },
    ];

    const createdMumbaiPlayers: any[] = [];
    for (const p of mumbaiPlayersData) {
      let player = await Player.findOne({ name: p.name, organizer: organizer._id });
      if (!player) {
        player = await Player.create({
          ...p,
          organizer: organizer._id,
          currentTeam: teams[0]._id,
        });
      }
      createdMumbaiPlayers.push(player);
      await TeamPlayer.findOneAndUpdate(
        { team: teams[0]._id, player: player._id, tournament: tournament._id },
        { isCaptain: p.name.includes("Hardik"), isWicketKeeper: p.name.includes("Ishan"), jerseyNumber: p.jerseyNumber },
        { upsert: true }
      );
    }

    const createdBangalorePlayers: any[] = [];
    for (const p of bangalorePlayersData) {
      let player = await Player.findOne({ name: p.name, organizer: organizer._id });
      if (!player) {
        player = await Player.create({
          ...p,
          organizer: organizer._id,
          currentTeam: teams[1]._id,
        });
      }
      createdBangalorePlayers.push(player);
      await TeamPlayer.findOneAndUpdate(
        { team: teams[1]._id, player: player._id, tournament: tournament._id },
        { isCaptain: p.name.includes("Faf"), isWicketKeeper: p.name.includes("Dinesh"), jerseyNumber: p.jerseyNumber },
        { upsert: true }
      );
    }

    // Set captains and wicketkeepers on teams
    await Team.findByIdAndUpdate(teams[0]._id, {
      captain: createdMumbaiPlayers[4]._id, // Hardik
      wicketkeeper: createdMumbaiPlayers[1]._id, // Ishan
    });

    await Team.findByIdAndUpdate(teams[1]._id, {
      captain: createdBangalorePlayers[0]._id, // Faf
      wicketkeeper: createdBangalorePlayers[5]._id, // Karthik
    });

    // Initialize Tournament Standings for all 4 teams
    for (const team of teams) {
      await TournamentStanding.findOneAndUpdate(
        { tournament: tournament._id, team: team._id },
        {
          tournament: tournament._id,
          team: team._id,
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
        { upsert: true }
      );
    }

    // Check if match already exists
    let liveMatch = await Match.findOne({
      tournament: tournament._id,
      matchNumber: 1,
    });

    if (!liveMatch) {
      // Create Live Match: Mumbai Strikers vs Bangalore Blasters
      liveMatch = await Match.create({
        tournament: tournament._id,
        matchNumber: 1,
        stage: "League Match 1",
        teamA: teams[0]._id, // Mumbai
        teamB: teams[1]._id, // Bangalore
        venue: "Wankhede Stadium, Mumbai",
        date: new Date(),
        time: "07:30 PM",
        overs: 20,
        status: "live",
        toss: {
          winner: teams[1]._id, // Bangalore won toss
          decision: "bat",
        },
        playingXI: {
          teamA: createdMumbaiPlayers.map((p) => p._id),
          teamB: createdBangalorePlayers.map((p) => p._id),
        },
        captain: {
          teamA: createdMumbaiPlayers[4]._id,
          teamB: createdBangalorePlayers[0]._id,
        },
        wicketKeeper: {
          teamA: createdMumbaiPlayers[1]._id,
          teamB: createdBangalorePlayers[5]._id,
        },
        assignedScorer: scorer._id,
        assignedUmpire: "Richard Illingworth, Nitin Menon",
        currentInnings: 1,
        inningsList: [],
        summary: {
          teamAScore: { runs: 0, wickets: 0, legalBalls: 0 },
          teamBScore: { runs: 42, wickets: 1, legalBalls: 24 }, // 42/1 in 4.0 overs
        },
      });

      // Create Innings 1: Bangalore Batting vs Mumbai Bowling
      const innings1 = await Innings.create({
        match: liveMatch._id,
        inningsNumber: 1,
        battingTeam: teams[1]._id, // Bangalore
        bowlingTeam: teams[0]._id, // Mumbai
        totalRuns: 42,
        totalWickets: 1,
        legalBalls: 24, // 4.0 overs
        status: "in_progress",
        extras: { wides: 2, noBalls: 1, byes: 0, legByes: 1, penalty: 0, total: 4 },
        fallOfWickets: [
          {
            wicketNumber: 1,
            player: createdBangalorePlayers[0]._id, // Faf du Plessis
            score: 28,
            overs: "2.4",
            legalBallIndex: 16,
          },
        ],
        battingScorecard: [
          {
            player: createdBangalorePlayers[0]._id, // Faf
            runs: 16,
            balls: 11,
            fours: 3,
            sixes: 0,
            strikeRate: 145.45,
            isOut: true,
            dismissalType: "caught",
            dismissalText: "c Ishan Kishan b Jasprit Bumrah",
            bowler: createdMumbaiPlayers[8]._id,
            fielder: createdMumbaiPlayers[1]._id,
            battingOrder: 1,
            isCurrentStriker: false,
            isCurrentNonStriker: false,
          },
          {
            player: createdBangalorePlayers[1]._id, // Virat Kohli
            runs: 22,
            balls: 13,
            fours: 2,
            sixes: 1,
            strikeRate: 169.23,
            isOut: false,
            dismissalText: "not out",
            battingOrder: 2,
            isCurrentStriker: true,
            isCurrentNonStriker: false,
          },
          {
            player: createdBangalorePlayers[2]._id, // Rajat Patidar
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            dismissalText: "not out",
            battingOrder: 3,
            isCurrentStriker: false,
            isCurrentNonStriker: true,
          },
        ],
        bowlingScorecard: [
          {
            player: createdMumbaiPlayers[8]._id, // Jasprit Bumrah
            legalBalls: 12,
            maidens: 0,
            runsConceded: 14,
            wickets: 1,
            wides: 0,
            noBalls: 0,
            economy: 7.0,
            isCurrentBowler: false,
          },
          {
            player: createdMumbaiPlayers[6]._id, // Gerald Coetzee
            legalBalls: 12,
            maidens: 0,
            runsConceded: 24,
            wickets: 0,
            wides: 2,
            noBalls: 1,
            economy: 12.0,
            isCurrentBowler: true,
          },
        ],
        currentStriker: createdBangalorePlayers[1]._id, // Virat Kohli
        currentNonStriker: createdBangalorePlayers[2]._id, // Rajat Patidar
        currentBowler: createdMumbaiPlayers[6]._id, // Gerald Coetzee
      });

      // Link Innings to Match
      liveMatch.inningsList = [innings1._id];
      await liveMatch.save();

      // Seed recent deliveries for commentary and ball chart
      await Delivery.create([
        {
          match: liveMatch._id,
          innings: innings1._id,
          inningsNumber: 1,
          sequenceNumber: 1,
          overNumber: 3,
          ballNumber: 5,
          legalBallNumber: 23,
          isLegal: true,
          striker: createdBangalorePlayers[1]._id,
          nonStriker: createdBangalorePlayers[2]._id,
          bowler: createdMumbaiPlayers[6]._id,
          runsBatter: 4,
          extras: { type: "none", runs: 0 },
          totalRuns: 4,
          commentary: "FOUR! Majestic cover drive from Virat Kohli, finding the boundary with pristine timing!",
          isUndone: false,
        },
        {
          match: liveMatch._id,
          innings: innings1._id,
          inningsNumber: 1,
          sequenceNumber: 2,
          overNumber: 3,
          ballNumber: 6,
          legalBallNumber: 24,
          isLegal: true,
          striker: createdBangalorePlayers[1]._id,
          nonStriker: createdBangalorePlayers[2]._id,
          bowler: createdMumbaiPlayers[6]._id,
          runsBatter: 1,
          extras: { type: "none", runs: 0 },
          totalRuns: 1,
          strikeChanged: true,
          commentary: "1 run. Pushed into the gap at mid-wicket to retain strike for the upcoming over.",
          isUndone: false,
        },
      ]);
    }

    return NextResponse.json({
      message: "Database seeded successfully with realistic tournament, teams, players, and active match!",
      tournamentId: tournament._id,
      matchId: liveMatch._id,
      accounts: {
        organizer: "organizer@cricscore.com / password123",
        scorer: "scorer@cricscore.com / password123",
        admin: "admin@cricscore.com / password123",
      },
    });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}

