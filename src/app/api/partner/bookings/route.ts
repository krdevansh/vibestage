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
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

const ADMIN_COMMISSION_PERCENT = 30;

// POST /api/partner/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "event_partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { artistId, eventName, eventType, date, venue, notes } = body;

    if (!artistId || !eventName || !date || !venue) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Get artist details
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
    }

    // Calculate prices
    const basePrice = artist.price;
    const finalPrice = Math.round(basePrice * (1 + ADMIN_COMMISSION_PERCENT / 100));
    const adminCommission = Math.round(basePrice * (ADMIN_COMMISSION_PERCENT / 100));
    const artistPayout = basePrice;

    // Create booking
    const booking = await Booking.create({
      eventName,
      eventType: eventType || "Private Event",
      artistId: artist._id,
      artistName: artist.name,
      artistUserId: artist.userId,
      organizerId: user.id,
      organizerName: user.name,
      organizerEmail: user.email,
      date: new Date(date),
      venue,
      budget: finalPrice,
      basePrice,
      finalPrice,
      adminCommission,
      artistPayout,
      status: "pending",
      paymentStatus: "unpaid",
      notes: notes || ""
    });

    // Create notification for artist
    await Notification.create({
      userId: artist.userId,
      type: "booking_request",
      title: "New Booking Request",
      message: `${user.name} wants to book you for "${eventName}"`,
      bookingId: booking._id
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/partner/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}

// GET /api/partner/bookings - Get all bookings for current partner
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "event_partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = { organizerId: user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("artistId", "name genre image location");

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("GET /api/partner/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// PUT /api/partner/bookings - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "event_partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { bookingId, action, paymentStatus } = body;

    const updateFields: any = {};
    
    if (action) {
      if (action === "cancel") updateFields.status = "cancelled";
      if (action === "markPaid") {
        updateFields.paymentStatus = "paid";
        updateFields.status = "paid";
      }
      if (action === "complete") {
        updateFields.status = "completed";
        updateFields.paymentStatus = "paid";
      }
    }
    
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, organizerId: user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Notify artist
    if (action === "cancel" || action === "markPaid" || action === "complete") {
      await Notification.create({
        userId: booking.artistId,
        type: action === "complete" ? "booking_completed" : "general",
        title: action === "cancel" ? "Booking Cancelled" : action === "markPaid" ? "Payment Received" : "Booking Completed",
        message: `Booking "${booking.eventName}" has been ${action === "cancel" ? "cancelled" : action === "markPaid" ? "marked as paid" : "completed"}`,
        bookingId: booking._id
      });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("PUT /api/partner/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}