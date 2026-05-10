import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
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
    if (!user || user.role !== "event_partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userData = await User.findById(user.id).select("-password");

    if (!userData) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error("GET /api/partner/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "event_partner") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const updateFields: any = {};
    if (body.name) updateFields.name = body.name;
    if (body.phone) updateFields.phone = body.phone;
    if (body.location) updateFields.location = body.location;
    if (body.companyName !== undefined) updateFields.companyName = body.companyName;
    if (body.companyLogo !== undefined) updateFields.companyLogo = body.companyLogo;
    if (body.profileImage !== undefined) updateFields.profileImage = body.profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // Update localStorage with new user data
    if (typeof window !== "undefined") {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...updatedUser }));
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PUT /api/partner/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}