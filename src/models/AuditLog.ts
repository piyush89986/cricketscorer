import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  entityType: "match" | "delivery" | "innings" | "tournament" | "user";
  entityId: string;
  details: any;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["match", "delivery", "innings", "tournament", "user"],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
