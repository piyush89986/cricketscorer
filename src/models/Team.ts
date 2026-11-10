import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  shortName: string;
  logo: string;
  city: string;
  organizer: mongoose.Types.ObjectId;
  captain?: mongoose.Types.ObjectId;
  wicketkeeper?: mongoose.Types.ObjectId;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true, uppercase: true },
    logo: { type: String, default: "" },
    city: { type: String, default: "" },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    captain: { type: Schema.Types.ObjectId, ref: "Player" },
    wicketkeeper: { type: Schema.Types.ObjectId, ref: "Player" },
    primaryColor: { type: String, default: "#16a34a" },
    secondaryColor: { type: String, default: "#0f172a" },
  },
  { timestamps: true }
);

export const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
export default Team;
