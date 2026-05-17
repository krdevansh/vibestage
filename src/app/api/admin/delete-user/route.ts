import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
import Notification from "@/models/Notification";
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

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { userId, email, action } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action" }, { status: 400 });
    }

    // Find user by userId or email
    let userToDelete;
    if (userId) {
      userToDelete = await User.findById(userId);
    } else if (email) {
      userToDelete = await User.findOne({ email });
    } else {
      return NextResponse.json({ success: false, error: "Missing userId or email" }, { status: 400 });
    }

    if (!userToDelete) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (action === "approve") {
      userToDelete.isDeleted = true;
      await userToDelete.save();

      if (userToDelete.role === "artist") {
        await Artist.findOneAndUpdate({ userId: userToDelete._id }, { isAvailable: false });
      }

      await Notification.create({
        userId: userToDelete._id,
        type: "general",
        title: "Account Deleted",
        message: "Your account has been deleted by admin. You can register again with the same email.",
      });

      return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    if (action === "reject") {
      await Notification.create({
        userId: userToDelete._id,
        type: "general",
        title: "Deletion Request Rejected",
        message: "Your account deletion request has been rejected by admin.",
      });

      return NextResponse.json({ success: true, message: "Deletion request rejected" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin delete-user error:", error);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
