import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    deviceInfo: { type: String, default: "Unknown" },
    ipAddress: { type: String, default: "Unknown" },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
