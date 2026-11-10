import mongoose from "mongoose";
import Match from "@/models/Match";
import Innings, { IInnings } from "@/models/Innings";
import Delivery, { IDelivery, ExtraType, DismissalType } from "@/models/Delivery";
import Player from "@/models/Player";
import AuditLog from "@/models/AuditLog";
import { updateTournamentStandingsAfterMatch } from "./nrr.service";
import { emitMatchUpdate } from "@/lib/socket";

export interface BallInput {
  matchId: string;
  inningsId: string;
  runsBatter: number; // 0, 1, 2, 3, 4, 5, 6
  extraType: ExtraType; // 'none', 'wide', 'no_ball', 'bye', 'leg_bye', 'penalty'
  extraRuns: number; // Extra penalty/byes
  isWicket: boolean;
  wicketType?: DismissalType;
  playerDismissedId?: string;
  newBatterId?: string; // If wicket fell
  newBowlerId?: string; // If over ended or manual change
  fielderId?: string;
  commentary?: string;
  idempotencyKey?: string;
  scorerId?: string;
}

export class ScoringService {
  /**
   * Authoritative delivery recording engine
   */
  public static async recordDelivery(input: BallInput) {
    const {
      matchId,
      inningsId,
      runsBatter,
      extraType,
      extraRuns,
      isWicket,
      wicketType,
      playerDismissedId,
      newBatterId,
      newBowlerId,
      fielderId,
      commentary,
      idempotencyKey,
      scorerId,
    } = input;

    // Check idempotency if key provided
    if (idempotencyKey) {
      const existingDelivery = await Delivery.findOne({ match: matchId, idempotencyKey });
      if (existingDelivery) {
        return {
          success: true,
          isDuplicate: true,
          delivery: existingDelivery,
          innings: await Innings.findById(inningsId),
          match: await Match.findById(matchId),
        };
      }
    }

    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    if (match.status === "completed") {
      throw new Error("Match is already completed. Cannot record further deliveries.");
    }

    const innings = await Innings.findById(inningsId);
    if (!innings) throw new Error("Innings not found");

    if (innings.status === "completed") {
      throw new Error("Innings is already completed.");
    }

    // Determine legal delivery status
    const isLegal = extraType !== "wide" && extraType !== "no_ball" && extraType !== "penalty";

    // Calculate total runs on this ball
    let totalRunsThisBall = runsBatter;
    if (extraType === "wide" || extraType === "no_ball") {
      totalRunsThisBall += (extraRuns > 0 ? extraRuns : 1);
    } else if (extraType === "bye" || extraType === "leg_bye" || extraType === "penalty") {
      totalRunsThisBall += extraRuns;
    }

    // Current state pointers
    let strikerId = innings.currentStriker?.toString();
    let nonStrikerId = innings.currentNonStriker?.toString();
    let bowlerId = innings.currentBowler?.toString();

    if (!strikerId || !nonStrikerId || !bowlerId) {
      throw new Error("Active striker, non-striker, or bowler is missing. Please set active players.");
    }

    // Update Innings cumulative totals
    innings.totalRuns += totalRunsThisBall;
    if (isLegal) {
      innings.legalBalls += 1;
    }

    // Update Innings Extras
    if (extraType === "wide") {
      innings.extras.wides += (extraRuns > 0 ? extraRuns : 1);
      innings.extras.total += (extraRuns > 0 ? extraRuns : 1);
    } else if (extraType === "no_ball") {
      innings.extras.noBalls += (extraRuns > 0 ? extraRuns : 1);
      innings.extras.total += (extraRuns > 0 ? extraRuns : 1);
    } else if (extraType === "bye") {
      innings.extras.byes += extraRuns;
      innings.extras.total += extraRuns;
    } else if (extraType === "leg_bye") {
      innings.extras.legByes += extraRuns;
      innings.extras.total += extraRuns;
    } else if (extraType === "penalty") {
      innings.extras.penalty += extraRuns;
      innings.extras.total += extraRuns;
    }

    // Update Batter Scorecard
    let batterScore = innings.battingScorecard.find(
      (b) => b.player.toString() === strikerId
    );

    if (!batterScore) {
      batterScore = {
        player: new mongoose.Types.ObjectId(strikerId),
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissalText: "not out",
        battingOrder: innings.battingScorecard.length + 1,
        isCurrentStriker: true,
        isCurrentNonStriker: false,
      };
      innings.battingScorecard.push(batterScore);
    }

    // Batter balls faced increments on all deliveries EXCEPT Wides
    if (extraType !== "wide") {
      batterScore.balls += 1;
    }

    batterScore.runs += runsBatter;
    if (runsBatter === 4) batterScore.fours += 1;
    if (runsBatter === 6) batterScore.sixes += 1;
    batterScore.strikeRate = parseFloat(((batterScore.runs / Math.max(1, batterScore.balls)) * 100).toFixed(2));

    // Update Bowler Figures
    let bowlerFigure = innings.bowlingScorecard.find(
      (b) => b.player.toString() === bowlerId
    );

    if (!bowlerFigure) {
      bowlerFigure = {
        player: new mongoose.Types.ObjectId(bowlerId),
        legalBalls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        economy: 0,
        isCurrentBowler: true,
      };
      innings.bowlingScorecard.push(bowlerFigure);
    }

    if (isLegal) {
      bowlerFigure.legalBalls += 1;
    }

    // Bowler concedes runsBatter + wides + noBalls (byes and leg byes do not count against bowler)
    let runsConcededOnBall = runsBatter;
    if (extraType === "wide") {
      bowlerFigure.wides += 1;
      runsConcededOnBall += (extraRuns > 0 ? extraRuns : 1);
    } else if (extraType === "no_ball") {
      bowlerFigure.noBalls += 1;
      runsConcededOnBall += (extraRuns > 0 ? extraRuns : 1);
    }
    bowlerFigure.runsConceded += runsConcededOnBall;
    bowlerFigure.economy = parseFloat(
      ((bowlerFigure.runsConceded / Math.max(1, bowlerFigure.legalBalls)) * 6).toFixed(2)
    );

    // Handle Wicket
    let dismissedPlayerId: string | undefined = undefined;
    if (isWicket) {
      innings.totalWickets += 1;
      dismissedPlayerId = playerDismissedId || strikerId;

      // Bowler gets credit unless it is run_out, timed_out, handled_ball, or obstructing_field
      const bowlerCredited =
        wicketType !== "run_out" &&
        wicketType !== "timed_out" &&
        wicketType !== "handled_ball" &&
        wicketType !== "obstructing_field";

      if (bowlerCredited) {
        bowlerFigure.wickets += 1;
      }

      // Mark dismissed batsman
      const outBatter = innings.battingScorecard.find(
        (b) => b.player.toString() === dismissedPlayerId
      );
      if (outBatter) {
        outBatter.isOut = true;
        outBatter.dismissalType = wicketType;
        outBatter.bowler = bowlerCredited ? new mongoose.Types.ObjectId(bowlerId) : undefined;
        outBatter.fielder = fielderId ? new mongoose.Types.ObjectId(fielderId) : undefined;

        let dismissalDesc = `${wicketType || "out"}`;
        if (wicketType === "bowled") dismissalDesc = "b Bowler";
        else if (wicketType === "caught") dismissalDesc = fielderId ? "c Fielder b Bowler" : "c & b Bowler";
        else if (wicketType === "lbw") dismissalDesc = "lbw b Bowler";
        else if (wicketType === "run_out") dismissalDesc = "run out";
        else if (wicketType === "stumped") dismissalDesc = "st Keeper b Bowler";

        outBatter.dismissalText = dismissalDesc;
        outBatter.isCurrentStriker = false;
        outBatter.isCurrentNonStriker = false;
      }

      // Record Fall of Wickets
      const oversStr = `${Math.floor(innings.legalBalls / 6)}.${innings.legalBalls % 6}`;
      innings.fallOfWickets.push({
        wicketNumber: innings.totalWickets,
        player: new mongoose.Types.ObjectId(dismissedPlayerId),
        score: innings.totalRuns,
        overs: oversStr,
        legalBallIndex: innings.legalBalls,
      });

      // Place new batter in crease if provided
      if (newBatterId) {
        if (dismissedPlayerId === strikerId) {
          strikerId = newBatterId;
        } else {
          nonStrikerId = newBatterId;
        }

        let newBatterEntry = innings.battingScorecard.find(
          (b) => b.player.toString() === newBatterId
        );
        if (!newBatterEntry) {
          innings.battingScorecard.push({
            player: new mongoose.Types.ObjectId(newBatterId),
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            dismissalText: "not out",
            battingOrder: innings.battingScorecard.length + 1,
            isCurrentStriker: dismissedPlayerId === strikerId,
            isCurrentNonStriker: dismissedPlayerId !== strikerId,
          });
        }
      }
    }

    // Strike Rotation logic:
    // If runs taken (runsBatter + byes + legByes) are odd, strikers cross!
    const runsForCrossing = runsBatter + (extraType === "bye" || extraType === "leg_bye" ? extraRuns : 0);
    let strikeChanged = false;

    if (runsForCrossing % 2 === 1) {
      const temp = strikerId;
      strikerId = nonStrikerId;
      nonStrikerId = temp;
      strikeChanged = true;
    }

    // Check End of Over:
    // If legal balls reached a multiple of 6 (and this was a legal delivery)
    const isOverComplete = isLegal && innings.legalBalls % 6 === 0;
    if (isOverComplete) {
      // Rotate strike at end of over
      const temp = strikerId;
      strikerId = nonStrikerId;
      nonStrikerId = temp;

      // Assign new bowler if provided
      if (newBowlerId) {
        bowlerId = newBowlerId;
      }
    }

    // Update active pointers in innings
    innings.currentStriker = new mongoose.Types.ObjectId(strikerId);
    innings.currentNonStriker = new mongoose.Types.ObjectId(nonStrikerId);
    innings.currentBowler = new mongoose.Types.ObjectId(bowlerId);

    // Update current flags on scorecard
    for (const b of innings.battingScorecard) {
      b.isCurrentStriker = b.player.toString() === strikerId;
      b.isCurrentNonStriker = b.player.toString() === nonStrikerId;
    }
    for (const bowl of innings.bowlingScorecard) {
      bowl.isCurrentBowler = bowl.player.toString() === bowlerId;
    }

    // Construct Commentary if not provided
    let autoCommentary = commentary;
    if (!autoCommentary) {
      if (isWicket) {
        autoCommentary = `OUT! ${wicketType?.toUpperCase()}! Major breakthrough for the bowling side!`;
      } else if (runsBatter === 6) {
        autoCommentary = `SIX! Smashed high and handsome over the ropes for a maximum!`;
      } else if (runsBatter === 4) {
        autoCommentary = `FOUR! Drilled through the gap with surgical precision!`;
      } else if (extraType === "wide") {
        autoCommentary = `Wide ball called by the umpire. Straying well down leg/off.`;
      } else if (extraType === "no_ball") {
        autoCommentary = `No ball! Bowler overstepped the crease. Free hit loading!`;
      } else if (totalRunsThisBall === 0) {
        autoCommentary = `Dot ball. Good tight line and length, solid defensive block.`;
      } else {
        autoCommentary = `${totalRunsThisBall} run${totalRunsThisBall > 1 ? "s" : ""} taken. Good running between the wickets.`;
      }
    }

    // Determine delivery sequence count
    const deliveryCount = await Delivery.countDocuments({ match: matchId, innings: innings._id });
    const currentOverNumber = Math.floor((innings.legalBalls - (isLegal ? 1 : 0)) / 6);
    const ballInOver = (innings.legalBalls % 6 === 0 && isLegal) ? 6 : (innings.legalBalls % 6);

    const delivery = await Delivery.create({
      match: matchId,
      innings: innings._id,
      inningsNumber: innings.inningsNumber,
      sequenceNumber: deliveryCount + 1,
      overNumber: currentOverNumber,
      ballNumber: ballInOver || 1,
      legalBallNumber: innings.legalBalls,
      isLegal,
      striker: new mongoose.Types.ObjectId(strikerId),
      nonStriker: new mongoose.Types.ObjectId(nonStrikerId),
      bowler: new mongoose.Types.ObjectId(bowlerId),
      runsBatter,
      extras: {
        type: extraType,
        runs: extraRuns || (extraType === "wide" || extraType === "no_ball" ? 1 : 0),
      },
      totalRuns: totalRunsThisBall,
      wicket: isWicket
        ? {
            isWicket: true,
            playerDismissed: new mongoose.Types.ObjectId(dismissedPlayerId),
            type: wicketType,
            fielder: fielderId ? new mongoose.Types.ObjectId(fielderId) : undefined,
          }
        : undefined,
      strikeChanged,
      commentary: autoCommentary,
      idempotencyKey,
      scorer: scorerId ? new mongoose.Types.ObjectId(scorerId) : undefined,
      isUndone: false,
    });

    // Check Innings End conditions
    const maxLegalBalls = match.overs * 6;
    const isAllOut = innings.totalWickets >= 10;
    const isOversLimitReached = innings.legalBalls >= maxLegalBalls;
    const isTargetReached = innings.inningsNumber === 2 && innings.target && innings.totalRuns >= innings.target;

    if (isAllOut || isOversLimitReached || isTargetReached) {
      innings.status = "completed";

      if (innings.inningsNumber === 1) {
        // Switch to innings break or start 2nd innings
        match.status = "innings_break";
        // Target for 2nd innings = 1st innings total runs + 1
        const target = innings.totalRuns + 1;

        // Create or initialize 2nd innings if not already created
        const existingInnings2 = await Innings.findOne({ match: matchId, inningsNumber: 2 });
        if (!existingInnings2) {
          const innings2 = await Innings.create({
            match: matchId,
            inningsNumber: 2,
            battingTeam: innings.bowlingTeam,
            bowlingTeam: innings.battingTeam,
            totalRuns: 0,
            totalWickets: 0,
            legalBalls: 0,
            target,
            status: "not_started",
            extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
            fallOfWickets: [],
            battingScorecard: [],
            bowlingScorecard: [],
          });
          match.inningsList.push(innings2._id);
        }
      } else if (innings.inningsNumber === 2) {
        // 2nd innings finished -> Match Completed!
        match.status = "completed";

        // Determine Match Winner
        const target = innings.target || 0;
        let winnerTeamId: any = null;
        let winType: any = null;
        let winMargin = 0;
        let summary = "";

        if (innings.totalRuns >= target) {
          // Batting team wins by remaining wickets
          winnerTeamId = innings.battingTeam;
          winType = "wickets";
          winMargin = 10 - innings.totalWickets;
          summary = `Batting team won by ${winMargin} wicket${winMargin > 1 ? "s" : ""}`;
        } else if (innings.totalRuns === target - 1) {
          // Tie
          winType = "tie";
          summary = "Match tied! Extraordinary contest!";
        } else {
          // Bowling team won by runs
          winnerTeamId = innings.bowlingTeam;
          winType = "runs";
          winMargin = (target - 1) - innings.totalRuns;
          summary = `Bowling team won by ${winMargin} run${winMargin > 1 ? "s" : ""}`;
        }

        match.result = {
          winner: winnerTeamId,
          winMargin,
          winType,
          summary,
        };

        // Update tournament standings & Net Run Rate automatically
        await updateTournamentStandingsAfterMatch(match._id.toString());
      }
    }

    // Update Match summary cache for fast index listing
    if (innings.inningsNumber === 1) {
      if (match.teamA.toString() === innings.battingTeam.toString()) {
        match.summary.teamAScore = {
          runs: innings.totalRuns,
          wickets: innings.totalWickets,
          legalBalls: innings.legalBalls,
        };
      } else {
        match.summary.teamBScore = {
          runs: innings.totalRuns,
          wickets: innings.totalWickets,
          legalBalls: innings.legalBalls,
        };
      }
    } else {
      if (match.teamA.toString() === innings.battingTeam.toString()) {
        match.summary.teamAScore = {
          runs: innings.totalRuns,
          wickets: innings.totalWickets,
          legalBalls: innings.legalBalls,
        };
      } else {
        match.summary.teamBScore = {
          runs: innings.totalRuns,
          wickets: innings.totalWickets,
          legalBalls: innings.legalBalls,
        };
      }
    }

    await innings.save();
    await match.save();

    // Emit live WebSocket update to all connected viewers and TV screens!
    emitMatchUpdate(matchId, "score-update", {
      matchId,
      innings,
      delivery,
      status: match.status,
      result: match.result,
    });

    return {
      success: true,
      delivery,
      innings,
      match,
      isOverComplete,
    };
  }

  /**
   * Undo Last Delivery with full audit trail and scorecard rollback
   */
  public static async undoLastDelivery(matchId: string, scorerId?: string) {
    const lastDelivery = await Delivery.findOne({ match: matchId, isUndone: false }).sort({ createdAt: -1 });
    if (!lastDelivery) {
      throw new Error("No deliveries found to undo.");
    }

    const innings = await Innings.findById(lastDelivery.innings);
    if (!innings) throw new Error("Innings not found");

    // Mark delivery as undone
    lastDelivery.isUndone = true;
    await lastDelivery.save();

    // Revert Innings totals
    innings.totalRuns = Math.max(0, innings.totalRuns - lastDelivery.totalRuns);
    if (lastDelivery.isLegal) {
      innings.legalBalls = Math.max(0, innings.legalBalls - 1);
    }

    // Revert Extras
    if (lastDelivery.extras.type === "wide") {
      innings.extras.wides = Math.max(0, innings.extras.wides - lastDelivery.extras.runs);
      innings.extras.total = Math.max(0, innings.extras.total - lastDelivery.extras.runs);
    } else if (lastDelivery.extras.type === "no_ball") {
      innings.extras.noBalls = Math.max(0, innings.extras.noBalls - lastDelivery.extras.runs);
      innings.extras.total = Math.max(0, innings.extras.total - lastDelivery.extras.runs);
    } else if (lastDelivery.extras.type === "bye") {
      innings.extras.byes = Math.max(0, innings.extras.byes - lastDelivery.extras.runs);
      innings.extras.total = Math.max(0, innings.extras.total - lastDelivery.extras.runs);
    } else if (lastDelivery.extras.type === "leg_bye") {
      innings.extras.legByes = Math.max(0, innings.extras.legByes - lastDelivery.extras.runs);
      innings.extras.total = Math.max(0, innings.extras.total - lastDelivery.extras.runs);
    }

    // Revert Batter
    const batterScore = innings.battingScorecard.find(
      (b) => b.player.toString() === lastDelivery.striker.toString()
    );
    if (batterScore) {
      batterScore.runs = Math.max(0, batterScore.runs - lastDelivery.runsBatter);
      if (lastDelivery.extras.type !== "wide") {
        batterScore.balls = Math.max(0, batterScore.balls - 1);
      }
      if (lastDelivery.runsBatter === 4) batterScore.fours = Math.max(0, batterScore.fours - 1);
      if (lastDelivery.runsBatter === 6) batterScore.sixes = Math.max(0, batterScore.sixes - 1);
      batterScore.strikeRate = parseFloat(
        ((batterScore.runs / Math.max(1, batterScore.balls)) * 100).toFixed(2)
      );
    }

    // Revert Bowler
    const bowlerFigure = innings.bowlingScorecard.find(
      (b) => b.player.toString() === lastDelivery.bowler.toString()
    );
    if (bowlerFigure) {
      if (lastDelivery.isLegal) {
        bowlerFigure.legalBalls = Math.max(0, bowlerFigure.legalBalls - 1);
      }
      let runsConceded = lastDelivery.runsBatter;
      if (lastDelivery.extras.type === "wide") {
        bowlerFigure.wides = Math.max(0, bowlerFigure.wides - 1);
        runsConceded += lastDelivery.extras.runs;
      } else if (lastDelivery.extras.type === "no_ball") {
        bowlerFigure.noBalls = Math.max(0, bowlerFigure.noBalls - 1);
        runsConceded += lastDelivery.extras.runs;
      }
      bowlerFigure.runsConceded = Math.max(0, bowlerFigure.runsConceded - runsConceded);
      bowlerFigure.economy = parseFloat(
        ((bowlerFigure.runsConceded / Math.max(1, bowlerFigure.legalBalls)) * 6).toFixed(2)
      );
    }

    // Revert Wicket if applicable
    if (lastDelivery.wicket && lastDelivery.wicket.isWicket) {
      innings.totalWickets = Math.max(0, innings.totalWickets - 1);
      const outBatter = innings.battingScorecard.find(
        (b) => b.player.toString() === lastDelivery.wicket?.playerDismissed?.toString()
      );
      if (outBatter) {
        outBatter.isOut = false;
        outBatter.dismissalType = "";
        outBatter.dismissalText = "not out";
      }
      if (bowlerFigure && lastDelivery.wicket.type !== "run_out") {
        bowlerFigure.wickets = Math.max(0, bowlerFigure.wickets - 1);
      }
      // Remove last fall of wicket
      innings.fallOfWickets.pop();
    }

    // Reset striker & non-striker to this delivery's pre-state
    innings.currentStriker = lastDelivery.striker;
    innings.currentNonStriker = lastDelivery.nonStriker;
    innings.currentBowler = lastDelivery.bowler;

    // Reset innings status back to in_progress if it was marked completed
    if (innings.status === "completed") {
      innings.status = "in_progress";
      const match = await Match.findById(matchId);
      if (match && match.status === "completed") {
        match.status = "live";
        match.result = undefined;
        await match.save();
      }
    }

    await innings.save();

    // Log in AuditLog
    await AuditLog.create({
      action: "UNDO_DELIVERY",
      entityType: "delivery",
      entityId: lastDelivery._id.toString(),
      details: {
        sequenceNumber: lastDelivery.sequenceNumber,
        runsBatter: lastDelivery.runsBatter,
        totalRuns: lastDelivery.totalRuns,
      },
      performedBy: scorerId ? new mongoose.Types.ObjectId(scorerId) : undefined,
    });

    // Broadcast update
    emitMatchUpdate(matchId, "score-update", {
      matchId,
      innings,
      action: "undo",
    });

    return {
      success: true,
      message: "Last delivery undone successfully",
      innings,
    };
  }
}

