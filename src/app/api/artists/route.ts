import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import User from "@/models/User";

// GET all artists (only non-deleted users)
export async function GET() {
  try {
    await connectDB();
    // Get all non-deleted user IDs
    const activeUsers = await User.find({ isDeleted: false }).select("_id");
    const activeUserIds = activeUsers.map(u => u._id);
    const artists = await Artist.find({ userId: { $in: activeUserIds } })
      .sort({ rating: -1 })
      .limit(20);
    return NextResponse.json({ success: true, data: artists });
  } catch (error) {
    console.error("GET /api/artists error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

// POST create artist
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const artist = await Artist.create(body);
    return NextResponse.json({ success: true, data: artist }, { status: 201 });
  } catch (error) {
    console.error("POST /api/artists error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create artist" },
      { status: 500 }
    );
  }
}
