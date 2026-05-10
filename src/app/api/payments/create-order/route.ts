import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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
    const { bookingId, amount } = body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.organizerId.toString() !== user.id) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: false, error: "Already paid" }, { status: 400 });
    }

    const orderAmount = amount || booking.finalPrice;

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ success: false, error: "Payment system not configured" }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: orderAmount * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        eventName: booking.eventName,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        bookingId: booking._id,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}