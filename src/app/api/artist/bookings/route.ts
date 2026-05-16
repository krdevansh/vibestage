import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/artist/bookings - Get all bookings for current artist
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "artist") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const artist = await Artist.findOne({ userId: user.id });
    if (!artist) {
      return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = { artistId: artist._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("organizerId", "name email phone");

    // Calculate earnings
    const completedBookings = await Booking.find({
      artistId: artist._id,
      status: "completed"
    });
    
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.artistPayout || 0), 0);
    const pendingPayouts = await Booking.find({
      artistId: artist._id,
      status: { $in: ["paid", "completed"] },
      paymentStatus: { $ne: "paid" }
    });
    const pendingAmount = pendingPayouts.reduce((sum, b) => sum + (b.artistPayout || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        stats: {
          totalBookings: bookings.length,
          totalEarnings,
          pendingPayouts: pendingAmount,
          completedPayouts: totalEarnings
        }
      }
    });
  } catch (error) {
    console.error("GET /api/artist/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// PUT /api/artist/bookings - Update booking status (accept/reject)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "artist") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const artist = await Artist.findOne({ userId: user.id });
    if (!artist) {
      return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
    }

    const body = await request.json();
    const { bookingId, action, acceptedDate, acceptedVenue } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newStatus = action === "accept" ? "accepted" : action === "reject" ? "rejected" : null;
    if (!newStatus) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    const updateData: any = { status: newStatus };
    if (newStatus === "accepted") {
      if (!acceptedDate || !acceptedVenue) {
        return NextResponse.json({ success: false, error: "Must select a date and venue to accept" }, { status: 400 });
      }
      updateData.acceptedDate = new Date(acceptedDate);
      updateData.acceptedVenue = acceptedVenue;
      updateData.date = new Date(acceptedDate);
      updateData.venue = acceptedVenue;
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, artistId: artist._id },
      { $set: updateData },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Create notification for organizer
    await Notification.create({
      userId: booking.organizerId,
      type: newStatus === "accepted" ? "booking_accepted" : "booking_rejected",
      title: newStatus === "accepted" ? "Booking Accepted" : "Booking Rejected",
      message: newStatus === "accepted"
        ? `Your booking "${booking.eventName}" has been accepted by ${artist.name} for ${acceptedDate} at ${acceptedVenue}`
        : `Your booking "${booking.eventName}" has been rejected by ${artist.name}`,
      bookingId: booking._id
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("PUT /api/artist/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}