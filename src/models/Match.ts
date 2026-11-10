import mongoose, { Schema, Document, Model } from "mongoose";

export type MatchStatus =
  | "upcoming"
  | "toss_completed"
  | "live"
  | "innings_break"
  | "completed"
  | "abandoned"
  | "cancelled";

export type TossDecision = "bat" | "bowl";
export type WinType = "runs" | "wickets" | "tie" | "draw" | "no_result";

export interface IMatch extends Document {
  tournament: mongoose.Types.ObjectId;
  matchNumber: number;
  stage: string;
  teamA: mongoose.Types.ObjectId;
  teamB: mongoose.Types.ObjectId;
  venue: string;
  date: Date;
  time: string;
  overs: number;
  status: MatchStatus;
  toss?: {
    winner: mongoose.Types.ObjectId;
    decision: TossDecision;
  };
  playingXI: {
    teamA: mongoose.Types.ObjectId[];
    teamB: mongoose.Types.ObjectId[];
  };
  captain: {
    teamA?: mongoose.Types.ObjectId;
    teamB?: mongoose.Types.ObjectId;
  };
  wicketKeeper: {
    teamA?: mongoose.Types.ObjectId;
    teamB?: mongoose.Types.ObjectId;
  };
  assignedScorer?: mongoose.Types.ObjectId;
  assignedUmpire?: string;
  currentInnings: number;
  inningsList: mongoose.Types.ObjectId[];
  summary: {
    teamAScore?: { runs: number; wickets: number; legalBalls: number };
    teamBScore?: { runs: number; wickets: number; legalBalls: number };
  };
  result?: {
    winner?: mongoose.Types.ObjectId;
    winMargin?: number;
    winType?: WinType;
    summary?: string;
    playerOfTheMatch?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    matchNumber: { type: Number, required: true },
    stage: { type: String, default: "League Match" },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, default: "10:00 AM" },
    overs: { type: Number, required: true, default: 20 },
    status: {
      type: String,
      enum: ["upcoming", "toss_completed", "live", "innings_break", "completed", "abandoned", "cancelled"],
      default: "upcoming",
      index: true,
    },
    toss: {
      winner: { type: Schema.Types.ObjectId, ref: "Team" },
      decision: { type: String, enum: ["bat", "bowl"] },
    },
    playingXI: {
      teamA: [{ type: Schema.Types.ObjectId, ref: "Player" }],
      teamB: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    },
    captain: {
      teamA: { type: Schema.Types.ObjectId, ref: "Player" },
      teamB: { type: Schema.Types.ObjectId, ref: "Player" },
    },
    wicketKeeper: {
      teamA: { type: Schema.Types.ObjectId, ref: "Player" },
      teamB: { type: Schema.Types.ObjectId, ref: "Player" },
    },
    assignedScorer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignedUmpire: { type: String, default: "" },
    currentInnings: { type: Number, default: 1 },
    inningsList: [{ type: Schema.Types.ObjectId, ref: "Innings" }],
    summary: {
      teamAScore: {
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        legalBalls: { type: Number, default: 0 },
      },
      teamBScore: {
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        legalBalls: { type: Number, default: 0 },
      },
    },
    result: {
      winner: { type: Schema.Types.ObjectId, ref: "Team" },
      winMargin: { type: Number },
      winType: { type: String, enum: ["runs", "wickets", "tie", "draw", "no_result"] },
      summary: { type: String },
      playerOfTheMatch: { type: Schema.Types.ObjectId, ref: "Player" },
    },
  },
  { timestamps: true }
);

export const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
export default Match;

