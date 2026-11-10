import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBatterScore {
  player: mongoose.Types.ObjectId;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalType?: string;
  dismissalText?: string;
  bowler?: mongoose.Types.ObjectId;
  fielder?: mongoose.Types.ObjectId;
  battingOrder: number;
  isCurrentStriker: boolean;
  isCurrentNonStriker: boolean;
}

export interface IBowlerFigure {
  player: mongoose.Types.ObjectId;
  legalBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  economy: number;
  isCurrentBowler: boolean;
}

export interface IFallOfWicket {
  wicketNumber: number;
  player: mongoose.Types.ObjectId;
  score: number;
  overs: string;
  legalBallIndex: number;
}

export interface IInnings extends Document {
  match: mongoose.Types.ObjectId;
  inningsNumber: number;
  battingTeam: mongoose.Types.ObjectId;
  bowlingTeam: mongoose.Types.ObjectId;
  totalRuns: number;
  totalWickets: number;
  legalBalls: number;
  target?: number;
  status: "not_started" | "in_progress" | "completed" | "declared";
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
    total: number;
  };
  fallOfWickets: IFallOfWicket[];
  battingScorecard: IBatterScore[];
  bowlingScorecard: IBowlerFigure[];
  currentStriker?: mongoose.Types.ObjectId;
  currentNonStriker?: mongoose.Types.ObjectId;
  currentBowler?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InningsSchema = new Schema<IInnings>(
  {
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    inningsNumber: { type: Number, required: true },
    battingTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    bowlingTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    legalBalls: { type: Number, default: 0 },
    target: { type: Number },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "declared"],
      default: "not_started",
    },
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
      penalty: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    fallOfWickets: [
      {
        wicketNumber: Number,
        player: { type: Schema.Types.ObjectId, ref: "Player" },
        score: Number,
        overs: String,
        legalBallIndex: Number,
      },
    ],
    battingScorecard: [
      {
        player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        strikeRate: { type: Number, default: 0 },
        isOut: { type: Boolean, default: false },
        dismissalType: { type: String, default: "" },
        dismissalText: { type: String, default: "not out" },
        bowler: { type: Schema.Types.ObjectId, ref: "Player" },
        fielder: { type: Schema.Types.ObjectId, ref: "Player" },
        battingOrder: { type: Number, default: 1 },
        isCurrentStriker: { type: Boolean, default: false },
        isCurrentNonStriker: { type: Boolean, default: false },
      },
    ],
    bowlingScorecard: [
      {
        player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
        legalBalls: { type: Number, default: 0 },
        maidens: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        isCurrentBowler: { type: Boolean, default: false },
      },
    ],
    currentStriker: { type: Schema.Types.ObjectId, ref: "Player" },
    currentNonStriker: { type: Schema.Types.ObjectId, ref: "Player" },
    currentBowler: { type: Schema.Types.ObjectId, ref: "Player" },
  },
  { timestamps: true }
);

export const Innings: Model<IInnings> =
  mongoose.models.Innings || mongoose.model<IInnings>("Innings", InningsSchema);
export default Innings;

