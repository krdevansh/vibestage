import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (razorpaySignature && RAZORPAY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
      
      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
      }
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.organizerId.toString() !== user.id) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    booking.paymentStatus = "paid";
    booking.status = "paid";
    booking.razorpayPaymentId = razorpayPaymentId || "";
    booking.razorpayOrderId = razorpayOrderId || "";
    booking.paidAt = new Date();
    booking.paymentMethod = "razorpay";
    await booking.save();

    await Notification.create({
      userId: booking.artistUserId,
      type: "payment",
      title: "Payment Received",
      message: `Payment of ₹${booking.finalPrice.toLocaleString()} received for "${booking.eventName}"`,
      bookingId: booking._id,
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        status: "paid",
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify payment" }, { status: 500 });
  }
}