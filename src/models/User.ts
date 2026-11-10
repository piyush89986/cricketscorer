import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "super_admin" | "organizer" | "scorer" | "spectator";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "organizer", "scorer", "spectator"],
      default: "organizer",
    },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    organization: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;

