import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import User from "@/models/User";
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
    const { artistId, eventName, eventType, proposedDates, proposedVenues, notes } = body;

    if (!artistId || !eventName || !proposedDates || !proposedDates.length || !proposedVenues || !proposedVenues.length) {
      return NextResponse.json({ success: false, error: "Missing required fields (artistId, eventName, proposedDates, proposedVenues)" }, { status: 400 });
    }

    if (proposedDates.length > 5 || proposedVenues.length > 5) {
      return NextResponse.json({ success: false, error: "Maximum 5 dates and 5 venues allowed" }, { status: 400 });
    }

    // Validate dates are in the future (tomorrow onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const d of proposedDates) {
      if (new Date(d) < tomorrow) {
        return NextResponse.json({ success: false, error: "All dates must be from tomorrow onwards" }, { status: 400 });
      }
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
      proposedDates: proposedDates.map((d: string) => new Date(d)),
      proposedVenues,
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
      .populate("artistId", "name genre image location upiId upiQrCode");

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
    if (!user || (user.role !== "event_partner" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { bookingId, action, paymentStatus, paymentType } = body;

    // Build query filter based on role
    const queryFilter: any = { _id: bookingId };
    if (user.role === "event_partner") {
      queryFilter.organizerId = user.id;
    }

    const updateFields: any = {};
    
    if (action) {
      if (action === "cancel") updateFields.status = "cancelled";
      if (action === "markPaid") {
        updateFields.paymentStatus = "paid";
        updateFields.status = "paid";
      }
      if (action === "complete") {
        updateFields.status = "completed";
      }
      if (action === "payAdmin") {
        if (user.role !== "event_partner") {
          return NextResponse.json({ success: false, error: "Only organizers can pay admin" }, { status: 403 });
        }
        updateFields.organizerPaidAdmin = true;
        if (paymentType === "advance") {
          updateFields.paymentStatus = "partial";
          updateFields.paymentType = "advance";
          updateFields.advancePaid = true;
          const advanceAmount = Math.round((body.advanceAmount || 0));
          if (advanceAmount > 0) updateFields.advanceAmount = advanceAmount;
        } else {
          updateFields.paymentStatus = "paid";
          updateFields.paymentType = "full";
        }
      }
      if (action === "payArtistRemaining") {
        if (user.role !== "event_partner") {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }
        updateFields.adminPaidArtist = true;
        updateFields.paymentStatus = "paid";
        updateFields.status = "paid";
      }
      if (action === "adminPaysArtist") {
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Only admin can mark artist payment" }, { status: 403 });
        }
        updateFields.adminPaidArtist = true;
        updateFields.paymentStatus = "paid";
        updateFields.status = "paid";
      }
      if (action === "submitPaymentProof") {
        if (user.role !== "event_partner") {
          return NextResponse.json({ success: false, error: "Only organizers can submit payment proof" }, { status: 403 });
        }
        const { screenshot, utr, paidAt } = body;
        if (!screenshot || !utr || !paidAt) {
          return NextResponse.json({ success: false, error: "Missing payment proof details (screenshot, utr, paidAt)" }, { status: 400 });
        }
        updateFields.status = "awaiting_confirmation";
        updateFields.paymentStatus = "pending_verification";
        updateFields["paymentProof.screenshot"] = screenshot;
        updateFields["paymentProof.utr"] = utr;
        updateFields["paymentProof.paidAt"] = new Date(paidAt);
      }
      if (action === "adminConfirmPayment") {
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Only admin can confirm payment" }, { status: 403 });
        }
        updateFields.status = "confirmed";
        updateFields.paymentStatus = "paid";
        updateFields.organizerPaidAdmin = true;
      }
      if (action === "adminRejectPayment") {
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Only admin can reject payment" }, { status: 403 });
        }
        updateFields.status = "rejected";
        updateFields.paymentStatus = "unpaid";
      }
    }
    
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const booking = await Booking.findOneAndUpdate(
      queryFilter,
      { $set: updateFields },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Notify artist
    if (action === "cancel" || action === "markPaid" || action === "complete") {
      await Notification.create({
        userId: booking.artistUserId,
        type: action === "complete" ? "booking_completed" : "general",
        title: action === "cancel" ? "Booking Cancelled" : action === "markPaid" ? "Payment Received" : "Booking Completed",
        message: `Booking "${booking.eventName}" has been ${action === "cancel" ? "cancelled" : action === "markPaid" ? "marked as paid" : "completed"}`,
        bookingId: booking._id
      });
    }

    // Helper to notify all admins
    const notifyAdmins = async (title: string, message: string) => {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await Notification.create({ userId: admin._id, type: "payment", title, message, bookingId: booking._id });
      }
    };

    // Notify about admin payment
    if (action === "payAdmin") {
      const isAdvance = paymentType === "advance";
      const amount = isAdvance ? (booking.advanceAmount || Math.round(booking.finalPrice * 0.3)) : booking.finalPrice;
      const remaining = isAdvance ? (booking.finalPrice - (booking.advanceAmount || Math.round(booking.finalPrice * 0.3))) : 0;

      await Notification.create({
        userId: booking.artistUserId,
        type: "payment",
        title: isAdvance ? "Advance Payment Received by Admin" : "Full Payment Received by Admin",
        message: `Payment of ₹${amount} received by admin for "${booking.eventName}"`,
        bookingId: booking._id
      });

      await notifyAdmins(
        isAdvance ? "Advance Payment Received" : "Full Payment Received",
        `₹${amount} received from ${booking.organizerName} for "${booking.eventName}"${isAdvance ? `. Artist ${booking.artistName} needs remaining ₹${remaining}` : `. Release ₹${booking.artistPayout} to ${booking.artistName}`}`
      );
    }

    if (action === "payArtistRemaining") {
      const remaining = booking.finalPrice - (booking.advanceAmount || Math.round(booking.finalPrice * 0.3));
      await Notification.create({
        userId: booking.artistUserId,
        type: "payment",
        title: "Remaining Payment Received",
        message: `Remaining payment of ₹${remaining.toLocaleString()} received for "${booking.eventName}"`,
        bookingId: booking._id
      });

      await notifyAdmins(
        "Remaining Payment Received by Artist",
        `${booking.organizerName} has paid remaining ₹${remaining} to ${booking.artistName} for "${booking.eventName}"`
      );
    }

    if (action === "adminPaysArtist") {
      await Notification.create({
        userId: booking.artistUserId,
        type: "payout",
        title: "Admin Released Payment",
        message: `Payment of ₹${booking.artistPayout.toLocaleString()} has been sent to your account for "${booking.eventName}"`,
        bookingId: booking._id
      });

      await notifyAdmins(
        "Payment Released to Artist",
        `₹${booking.artistPayout} released to ${booking.artistName} for "${booking.eventName}"`
      );
    }

    if (action === "submitPaymentProof") {
      await Notification.create({
        userId: booking.artistUserId,
        type: "payment",
        title: "Payment Proof Submitted",
        message: `${booking.organizerName} has submitted payment proof for "${booking.eventName}"`,
        bookingId: booking._id
      });

      await notifyAdmins(
        "Payment Proof Submitted",
        `${booking.organizerName} submitted payment proof (UTR: ${body.utr}) for "${booking.eventName}". Verify and confirm.`
      );
    }

    if (action === "adminConfirmPayment") {
      await Notification.create({
        userId: booking.artistUserId,
        type: "booking_accepted",
        title: "Booking Confirmed",
        message: `Payment verified! Booking "${booking.eventName}" is confirmed.`,
        bookingId: booking._id
      });

      await Notification.create({
        userId: booking.organizerId,
        type: "booking_accepted",
        title: "Booking Confirmed",
        message: `Your payment has been verified! Booking "${booking.eventName}" is confirmed.`,
        bookingId: booking._id
      });

      await notifyAdmins(
        "Booking Confirmed",
        `Payment for "${booking.eventName}" by ${booking.artistName} has been confirmed.`
      );
    }

    if (action === "adminRejectPayment") {
      await Notification.create({
        userId: booking.organizerId,
        type: "booking_rejected",
        title: "Payment Rejected",
        message: `Your payment proof for "${booking.eventName}" has been rejected. Please contact admin.`,
        bookingId: booking._id
      });

      await notifyAdmins(
        "Payment Rejected",
        `Payment for "${booking.eventName}" by ${booking.organizerName} has been rejected.`
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("PUT /api/partner/bookings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
  }
}