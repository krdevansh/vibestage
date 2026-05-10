import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import User from "@/models/User";
import Booking from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "artists") {
      const artists = await Artist.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: artists });
    }

    if (type === "partners") {
      const partners = await User.find({ role: "event_partner" }).select("-password").sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: partners });
    }

    if (type === "bookings") {
      const bookings = await Booking.find({})
        .populate("artistId", "name genre image")
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: bookings });
    }

    if (type === "analytics") {
      const totalArtists = await Artist.countDocuments();
      const totalPartners = await User.countDocuments({ role: "event_partner" });
      const totalBookings = await Booking.countDocuments();
      
      const completedBookings = await Booking.find({ status: "completed" });
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.budget || 0), 0);
      const commission = totalRevenue * 0.3;

      return NextResponse.json({
        success: true,
        data: {
          totalArtists,
          totalPartners,
          totalBookings,
          totalRevenue,
          commission,
        }
      });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const model = searchParams.get("model");

    if (!id || !model) {
      return NextResponse.json({ success: false, error: "Missing id or model" }, { status: 400 });
    }

    if (model === "artist") {
      const artist = await Artist.findById(id);
      if (artist) {
        await User.findByIdAndUpdate(artist.userId, { isDeleted: true });
        await Artist.findByIdAndDelete(id);
      }
    } else if (model === "partner") {
      await User.findByIdAndUpdate(id, { isDeleted: true });
    } else if (model === "booking") {
      await Booking.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}