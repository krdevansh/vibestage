import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  artistId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);