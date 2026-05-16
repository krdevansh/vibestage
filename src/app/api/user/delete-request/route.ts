import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user || !["artist", "event_partner"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await Notification.create({
        userId: admin._id,
        type: "general",
        title: "Account Deletion Request",
        message: `${user.name} (${user.email}) - ${user.role} has requested account deletion. Review in Admin Dashboard.`,
      });
    }

    return NextResponse.json({ success: true, message: "Deletion request sent to admin" });
  } catch (error) {
    console.error("DELETE request error:", error);
    return NextResponse.json({ success: false, error: "Failed to send request" }, { status: 500 });
  }
}
