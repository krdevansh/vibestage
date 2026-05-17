import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import User from "@/models/User";

// GET all artists (only non-deleted users)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const verifiedOnly = searchParams.get("verified") === "true";

    // Get all non-deleted user IDs
    const activeUsers = await User.find({ isDeleted: false }).select("_id");
    const activeUserIds = activeUsers.map(u => u._id);
    const query: any = { userId: { $in: activeUserIds } };
    if (verifiedOnly) query.isVerified = true;
    const artists = await Artist.find(query)
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
