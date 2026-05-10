import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

// GET all bookings
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find({})
      .populate("artistId", "name genre image")
      .sort({ createdAt: -1 })
      .limit(20);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST create booking
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const booking = await Booking.create(body);
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
