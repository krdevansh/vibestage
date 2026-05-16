import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  eventName: string;
  eventType: string;
  artistId: mongoose.Types.ObjectId;
  artistName: string;
  artistUserId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  organizerEmail: string;
  date: Date;
  venue: string;
  proposedDates: Date[];
  proposedVenues: string[];
  acceptedDate: Date;
  acceptedVenue: string;
  budget: number;
  basePrice: number;
  finalPrice: number;
  adminCommission: number;
  artistPayout: number;
  status: "pending" | "accepted" | "rejected" | "paid" | "completed" | "cancelled";
  advancePaid: boolean;
  paymentStatus: "unpaid" | "partial" | "paid";
  paymentType: "full" | "advance";
  advanceAmount: number;
  organizerPaidAdmin: boolean;
  adminPaidArtist: boolean;
  adminPaymentId: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: Date;
  notes: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventName: { type: String, required: true },
    eventType: { type: String, default: "Private Event" },
    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    artistName: { type: String, default: "" },
    artistUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizerName: { type: String, default: "" },
    organizerEmail: { type: String, required: true },
    date: { type: Date },
    venue: { type: String, default: "" },
    proposedDates: [{ type: Date }],
    proposedVenues: [{ type: String }],
    acceptedDate: { type: Date },
    acceptedVenue: { type: String, default: "" },
    budget: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    adminCommission: { type: Number, required: true },
    artistPayout: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "paid", "completed", "cancelled"],
      default: "pending",
    },
    advancePaid: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentType: { type: String, enum: ["full", "advance"], default: "full" },
    advanceAmount: { type: Number, default: 0 },
    organizerPaidAdmin: { type: Boolean, default: false },
    adminPaidArtist: { type: Boolean, default: false },
    adminPaymentId: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    paidAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
