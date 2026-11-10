import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITournamentStanding extends Document {
  tournament: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsScored: number;
  oversFacedLegalBalls: number;
  runsConceded: number;
  oversBowledLegalBalls: number;
  netRunRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentStandingSchema = new Schema<ITournamentStanding>(
  {
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    tied: { type: Number, default: 0 },
    noResult: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    runsScored: { type: Number, default: 0 },
    oversFacedLegalBalls: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    oversBowledLegalBalls: { type: Number, default: 0 },
    netRunRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TournamentStandingSchema.index({ tournament: 1, team: 1 }, { unique: true });

export const TournamentStanding: Model<ITournamentStanding> =
  mongoose.models.TournamentStanding ||
  mongoose.model<ITournamentStanding>("TournamentStanding", TournamentStandingSchema);
export default TournamentStanding;
