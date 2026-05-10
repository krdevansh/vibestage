import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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

// GET /api/artist/profile - Get current artist's profile
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "artist") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const artist = await Artist.findOne({ userId: user.id });

    if (!artist) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: artist });
  } catch (error) {
    console.error("GET /api/artist/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/artist/profile - Update artist's profile
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "artist") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const updateFields: any = {};
    if (body.name) updateFields.name = body.name;
    if (body.stageName !== undefined) updateFields.stageName = body.stageName;
    if (body.realName !== undefined) updateFields.realName = body.realName;
    if (body.phone) updateFields.phone = body.phone;
    if (body.location) updateFields.location = body.location;
    if (body.city !== undefined) updateFields.city = body.city;
    if (body.genre) updateFields.genre = body.genre;
    if (body.bio !== undefined) updateFields.bio = body.bio;
    if (body.languages) updateFields.languages = body.languages;
    if (body.performanceLanguages) updateFields.performanceLanguages = body.performanceLanguages;
    if (body.socialLinks) updateFields.socialLinks = body.socialLinks;
    if (body.isAvailable !== undefined) updateFields.isAvailable = body.isAvailable;
    if (body.videoUrl !== undefined) updateFields.videoUrl = body.videoUrl;
    if (body.gallery) updateFields.gallery = body.gallery;
    
    // Only allow price update if provided (system should calculate final price)
    if (body.price !== undefined) updateFields.price = body.price;
    if (body.image) updateFields.image = body.image;
    if (body.coverImage !== undefined) updateFields.coverImage = body.coverImage;

    const artist = await Artist.findOneAndUpdate(
      { userId: user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!artist) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: artist });
  } catch (error) {
    console.error("PUT /api/artist/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}