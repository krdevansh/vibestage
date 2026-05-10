import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Artist from "@/models/Artist";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ success: false, error: "Missing id or type" }, { status: 400 });
    }

    if (type === "artist") {
      const artist = await Artist.findById(id);
      if (!artist) {
        return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: artist });
    }

    if (type === "partner") {
      const partner = await User.findById(id).select("-password");
      if (!partner) {
        return NextResponse.json({ success: false, error: "Partner not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: partner });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin profile GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}
