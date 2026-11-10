import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamPlayer extends Document {
  team: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  tournament?: mongoose.Types.ObjectId;
  isCaptain: boolean;
  isWicketKeeper: boolean;
  jerseyNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeamPlayerSchema = new Schema<ITeamPlayer>(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", index: true },
    isCaptain: { type: Boolean, default: false },
    isWicketKeeper: { type: Boolean, default: false },
    jerseyNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to avoid duplicate player in same team/tournament
TeamPlayerSchema.index({ team: 1, player: 1, tournament: 1 }, { unique: true });

export const TeamPlayer: Model<ITeamPlayer> =
  mongoose.models.TeamPlayer || mongoose.model<ITeamPlayer>("TeamPlayer", TeamPlayerSchema);
export default TeamPlayer;
