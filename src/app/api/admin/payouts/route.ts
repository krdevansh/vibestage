import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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
    const user = getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "pending") {
      const artists = await Artist.find({
        $expr: { $gt: [{ $subtract: ["$totalBookings", "$completedBookings"] }, 0] }
      }).populate("userId", "name email phone");

      const pendingPayouts = await Promise.all(
        artists.map(async (artist) => {
          const paidBookings = await Booking.find({
            artistId: artist._id,
            status: { $in: ["paid", "completed"] },
            paymentStatus: "paid",
          });
          const pendingAmount = paidBookings
            .filter(b => b.status !== "cancelled")
            .reduce((sum, b) => sum + (b.artistPayout || 0), 0);
          return {
            artist,
            pendingAmount,
            bookingCount: paidBookings.length,
          };
        })
      );

      return NextResponse.json({ success: true, data: pendingPayouts });
    }

    if (action === "summary") {
      const allBookings = await Booking.find({ paymentStatus: "paid" });
      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
      const totalCommission = allBookings.reduce((sum, b) => sum + (b.adminCommission || 0), 0);
      const pendingPayouts = allBookings
        .filter(b => b.status !== "completed" && b.status !== "cancelled")
        .reduce((sum, b) => sum + (b.artistPayout || 0), 0);

      return NextResponse.json({
        success: true,
        data: {
          totalRevenue,
          totalCommission,
          pendingPayouts,
          completedPayouts: totalRevenue - totalCommission - pendingPayouts,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin payouts GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payouts" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { artistId, amount } = body;

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
    }

    artist.payoutStatus = "paid";
    artist.payoutAmount = (artist.payoutAmount || 0) + (amount || 0);
    artist.completedBookings = (artist.completedBookings || 0) + 1;
    await artist.save();

    return NextResponse.json({ success: true, message: "Payout marked as paid" });
  } catch (error) {
    console.error("Admin payouts PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update payout" }, { status: 500 });
  }
}