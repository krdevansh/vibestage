import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  role: "artist" | "event_partner" | "admin";
  isDeleted: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  blockedAt: Date;
  companyName?: string;
  companyLogo?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    role: {
      type: String,
      enum: ["artist", "event_partner", "admin"],
      default: "event_partner",
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
