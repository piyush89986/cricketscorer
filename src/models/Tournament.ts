import mongoose, { Schema, Document, Model } from "mongoose";

export type TournamentFormat = "single_elimination" | "round_robin" | "group_knockout" | "double_round_robin";
export type TournamentStatus = "draft" | "registration" | "ongoing" | "completed" | "cancelled";

export interface ITournament extends Document {
  name: string;
  slug: string;
  organizer: mongoose.Types.ObjectId;
  description: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  format: TournamentFormat;
  overs: number;
  ballType: "tennis_light" | "tennis_heavy" | "leather";
  maxTeams: number;
  rules: {
    pointsWin: number;
    pointsTie: number;
    pointsLoss: number;
    pointsNR: number;
  };
  status: TournamentStatus;
  logo: string;
  banner: string;
  sponsors: Array<{ name: string; logo: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, default: "" },
    venue: { type: String, required: true, default: "Main Stadium" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    format: {
      type: String,
      enum: ["single_elimination", "round_robin", "group_knockout", "double_round_robin"],
      default: "round_robin",
    },
    overs: { type: Number, required: true, default: 20 },
    ballType: {
      type: String,
      enum: ["tennis_light", "tennis_heavy", "leather"],
      default: "leather",
    },
    maxTeams: { type: Number, default: 8 },
    rules: {
      pointsWin: { type: Number, default: 2 },
      pointsTie: { type: Number, default: 1 },
      pointsLoss: { type: Number, default: 0 },
      pointsNR: { type: Number, default: 1 },
    },
    status: {
      type: String,
      enum: ["draft", "registration", "ongoing", "completed", "cancelled"],
      default: "registration",
      index: true,
    },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    sponsors: [
      {
        name: { type: String, default: "" },
        logo: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);
export default Tournament;

