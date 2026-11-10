import mongoose, { Schema, Document, Model } from "mongoose";

export type PlayingRole = "batsman" | "bowler" | "all_rounder" | "wicket_keeper";
export type BattingStyle = "right_hand" | "left_hand";
export type BowlingStyle =
  | "right_arm_fast"
  | "right_arm_medium"
  | "right_arm_spin"
  | "left_arm_fast"
  | "left_arm_medium"
  | "left_arm_spin"
  | "none";

export interface IPlayer extends Document {
  name: string;
  jerseyNumber?: number;
  role: PlayingRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  avatar?: string;
  age?: number;
  phone?: string;
  email?: string;
  currentTeam?: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true },
    jerseyNumber: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["batsman", "bowler", "all_rounder", "wicket_keeper"],
      default: "all_rounder",
    },
    battingStyle: {
      type: String,
      enum: ["right_hand", "left_hand"],
      default: "right_hand",
    },
    bowlingStyle: {
      type: String,
      enum: [
        "right_arm_fast",
        "right_arm_medium",
        "right_arm_spin",
        "left_arm_fast",
        "left_arm_medium",
        "left_arm_spin",
        "none",
      ],
      default: "right_arm_medium",
    },
    avatar: { type: String, default: "" },
    age: { type: Number },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    currentTeam: { type: Schema.Types.ObjectId, ref: "Team" },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export const Player: Model<IPlayer> = mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
export default Player;

