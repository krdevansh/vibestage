import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
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

    if (action === "all") {
      const users = await User.find({ role: { $ne: "admin" } })
        .select("-password")
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: users });
    }

    if (action === "artists") {
      const artists = await Artist.find({}).populate("userId", "name email phone isVerified isBlocked");
      return NextResponse.json({ success: true, data: artists });
    }

    if (action === "unverified") {
      const users = await User.find({ role: { $ne: "admin" }, isVerified: false })
        .select("-password");
      return NextResponse.json({ success: true, data: users });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
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
    const { userId, action, type } = body;

    if (action === "verify") {
      if (type === "artist") {
        const artist = await Artist.findById(userId);
        if (!artist) {
          return NextResponse.json({ success: false, error: "Artist not found" }, { status: 404 });
        }
        artist.isVerified = true;
        artist.verifiedAt = new Date();
        await artist.save();

        await User.findByIdAndUpdate(artist.userId, { isVerified: true });
        return NextResponse.json({ success: true, message: "Artist verified" });
      }
    }

    if (action === "block") {
      const userToBlock = await User.findById(userId);
      if (!userToBlock) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      userToBlock.isBlocked = true;
      userToBlock.blockedAt = new Date();
      await userToBlock.save();
      return NextResponse.json({ success: true, message: "User blocked" });
    }

    if (action === "unblock") {
      const userToUnblock = await User.findById(userId);
      if (!userToUnblock) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      userToUnblock.isBlocked = false;
      userToUnblock.blockedAt = null;
      await userToUnblock.save();
      return NextResponse.json({ success: true, message: "User unblocked" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}