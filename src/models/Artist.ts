import mongoose, { Schema, Document } from "mongoose";

export interface IArtist extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  stageName: string;
  realName: string;
  genre: string[];
  price: number;
  image: string;
  coverImage: string;
  gallery: string[];
  videoUrl: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  responseTime: string;
  location: string;
  city: string;
  bio: string;
  email: string;
  phone: string;
  languages: string[];
  performanceLanguages: string[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  availableDates: Date[];
  isAvailable: boolean;
  isVerified: boolean;
  verifiedAt: Date;
  payoutStatus: "pending" | "paid";
  payoutAmount: number;
  createdAt: Date;
}

const ArtistSchema = new Schema<IArtist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    stageName: { type: String, default: "" },
    realName: { type: String, default: "" },
    genre: [{ type: String }],
    price: { type: Number, required: true },
    image: { type: String, required: true },
    coverImage: { type: String, default: "" },
    gallery: [{ type: String }],
    videoUrl: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    responseTime: { type: String, default: "Within 24 hours" },
    location: { type: String, required: true },
    city: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    languages: [{ type: String }],
    performanceLanguages: [{ type: String }],
    socialLinks: {
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    availableDates: [{ type: Date }],
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    payoutStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    payoutAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Artist || mongoose.model<IArtist>("Artist", ArtistSchema);
