import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Artist from "@/models/Artist";
import Booking from "@/models/Booking";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artistId");

    await connectDB();
    const query = artistId ? { artistId } : {};
    const reviews = await Review.find(query)
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("GET reviews error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
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
    const { bookingId, rating, comment } = body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.organizerId.toString() !== user.id) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    if (booking.status !== "completed" && booking.status !== "paid") {
      return NextResponse.json({ success: false, error: "Can only review completed bookings" }, { status: 400 });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return NextResponse.json({ success: false, error: "Already reviewed" }, { status: 400 });
    }

    const review = await Review.create({
      artistId: booking.artistId,
      bookingId: booking._id,
      reviewerId: user.id,
      reviewerName: booking.organizerName,
      rating,
      comment: comment || "",
    });

    const reviews = await Review.find({ artistId: booking.artistId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Artist.findByIdAndUpdate(booking.artistId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}