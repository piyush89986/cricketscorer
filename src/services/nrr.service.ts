import mongoose from "mongoose";
import TournamentStanding from "@/models/TournamentStanding";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Tournament from "@/models/Tournament";

/**
 * Converts legal balls to exact decimal overs according to cricket NRR mathematics:
 * Overs = full_overs + (balls / 6)
 */
export function legalBallsToExactOvers(legalBalls: number): number {
  const fullOvers = Math.floor(legalBalls / 6);
  const remainderBalls = legalBalls % 6;
  return fullOvers + remainderBalls / 6;
}

/**
 * Recalculates and updates standings for both teams after a match concludes
 */
export async function updateTournamentStandingsAfterMatch(matchId: string) {
  const match = await Match.findById(matchId).populate("tournament");
  if (!match || match.status !== "completed") return;

  const tournament = match.tournament as any;
  if (!tournament) return;

  // Find both innings of this match
  const inningsList = await Innings.find({ match: match._id });
  if (inningsList.length === 0) return;

  const winPoints = tournament.rules?.pointsWin ?? 2;
  const tiePoints = tournament.rules?.pointsTie ?? 1;
  const lossPoints = tournament.rules?.pointsLoss ?? 0;
  const nrPoints = tournament.rules?.pointsNR ?? 1;

  // Find all completed matches for this tournament to recalculate full NRR and points accurately
  const allCompletedMatches = await Match.find({
    tournament: tournament._id,
    status: "completed",
  });

  // Get all teams in this tournament
  const standings = await TournamentStanding.find({ tournament: tournament._id });

  for (const standing of standings) {
    const teamIdStr = standing.team.toString();
    let played = 0;
    let won = 0;
    let lost = 0;
    let tied = 0;
    let noResult = 0;
    let points = 0;

    let totalRunsScored = 0;
    let totalOversFacedDec = 0;
    let totalRunsConceded = 0;
    let totalOversBowledDec = 0;

    for (const m of allCompletedMatches) {
      const isTeamA = m.teamA.toString() === teamIdStr;
      const isTeamB = m.teamB.toString() === teamIdStr;
      if (!isTeamA && !isTeamB) continue;

      played += 1;

      // Result points
      if (m.result?.winType === "tie") {
        tied += 1;
        points += tiePoints;
      } else if (m.result?.winType === "no_result") {
        noResult += 1;
        points += nrPoints;
      } else if (m.result?.winner?.toString() === teamIdStr) {
        won += 1;
        points += winPoints;
      } else {
        lost += 1;
        points += lossPoints;
      }

      // Fetch innings for NRR calculations
      const matchInnings = await Innings.find({ match: m._id });
      for (const inn of matchInnings) {
        const isBatting = inn.battingTeam.toString() === teamIdStr;
        const isBowling = inn.bowlingTeam.toString() === teamIdStr;
        const maxAllottedLegalBalls = m.overs * 6;

        if (isBatting) {
          totalRunsScored += inn.totalRuns;
          // ICC All-Out Rule: If bowled out, overs faced is deemed the full allotted overs
          let effectiveBalls = inn.legalBalls;
          if (inn.totalWickets >= 10) {
            effectiveBalls = maxAllottedLegalBalls;
          }
          totalOversFacedDec += legalBallsToExactOvers(effectiveBalls);
        } else if (isBowling) {
          totalRunsConceded += inn.totalRuns;
          // Opponent All-Out Rule: If opponent was bowled out, overs bowled is deemed full allotted overs
          let effectiveBalls = inn.legalBalls;
          if (inn.totalWickets >= 10) {
            effectiveBalls = maxAllottedLegalBalls;
          }
          totalOversBowledDec += legalBallsToExactOvers(effectiveBalls);
        }
      }
    }

    // Calculate Net Run Rate
    const runRateFor = totalOversFacedDec > 0 ? totalRunsScored / totalOversFacedDec : 0;
    const runRateAgainst = totalOversBowledDec > 0 ? totalRunsConceded / totalOversBowledDec : 0;
    const netRunRate = parseFloat((runRateFor - runRateAgainst).toFixed(3));

    standing.played = played;
    standing.won = won;
    standing.lost = lost;
    standing.tied = tied;
    standing.noResult = noResult;
    standing.points = points;
    standing.runsScored = totalRunsScored;
    standing.oversFacedLegalBalls = Math.round(totalOversFacedDec * 6);
    standing.runsConceded = totalRunsConceded;
    standing.oversBowledLegalBalls = Math.round(totalOversBowledDec * 6);
    standing.netRunRate = netRunRate;

    await standing.save();
  }
}

