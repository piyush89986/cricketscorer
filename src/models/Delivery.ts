import mongoose, { Schema, Document, Model } from "mongoose";

export type ExtraType = "none" | "wide" | "no_ball" | "bye" | "leg_bye" | "penalty";
export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run_out"
  | "stumped"
  | "hit_wicket"
  | "handled_ball"
  | "obstructing_field"
  | "timed_out"
  | "retired_out"
  | "retired_hurt";

export interface IDelivery extends Document {
  match: mongoose.Types.ObjectId;
  innings: mongoose.Types.ObjectId;
  inningsNumber: number;
  sequenceNumber: number;
  overNumber: number;
  ballNumber: number;
  legalBallNumber: number;
  isLegal: boolean;
  striker: mongoose.Types.ObjectId;
  nonStriker: mongoose.Types.ObjectId;
  bowler: mongoose.Types.ObjectId;
  runsBatter: number;
  extras: {
    type: ExtraType;
    runs: number;
  };
  totalRuns: number;
  wicket?: {
    isWicket: boolean;
    playerDismissed?: mongoose.Types.ObjectId;
    type?: DismissalType;
    fielder?: mongoose.Types.ObjectId;
  };
  strikeChanged: boolean;
  commentary: string;
  idempotencyKey?: string;
  scorer?: mongoose.Types.ObjectId;
  isUndone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    innings: { type: Schema.Types.ObjectId, ref: "Innings", required: true, index: true },
    inningsNumber: { type: Number, required: true },
    sequenceNumber: { type: Number, required: true },
    overNumber: { type: Number, required: true },
    ballNumber: { type: Number, required: true },
    legalBallNumber: { type: Number, required: true },
    isLegal: { type: Boolean, required: true, default: true },
    striker: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    nonStriker: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    bowler: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    runsBatter: { type: Number, default: 0 },
    extras: {
      type: {
        type: String,
        enum: ["none", "wide", "no_ball", "bye", "leg_bye", "penalty"],
        default: "none",
      },
      runs: { type: Number, default: 0 },
    },
    totalRuns: { type: Number, required: true, default: 0 },
    wicket: {
      isWicket: { type: Boolean, default: false },
      playerDismissed: { type: Schema.Types.ObjectId, ref: "Player" },
      type: { type: String },
      fielder: { type: Schema.Types.ObjectId, ref: "Player" },
    },
    strikeChanged: { type: Boolean, default: false },
    commentary: { type: String, default: "" },
    idempotencyKey: { type: String, index: true },
    scorer: { type: Schema.Types.ObjectId, ref: "User" },
    isUndone: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Delivery: Model<IDelivery> =
  mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);
export default Delivery;
