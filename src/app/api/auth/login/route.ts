import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

const MAX_SESSIONS: Record<string, number> = {
  admin: 5,
  event_partner: 3,
  artist: 3,
};

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { success: false, error: "Account deleted. You can register again with the same email." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const requestedRole = req.nextUrl.searchParams.get("role");
    if (requestedRole && user.role !== requestedRole) {
      return NextResponse.json(
        { success: false, error: "Access denied: You do not have the required role for this section" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Track session
    const deviceInfo = req.headers.get("user-agent") || "Unknown";
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown";
    const role = user.role;
    const maxAllowed = MAX_SESSIONS[role] || 3;

    // Count existing active sessions
    const activeSessions = await Session.countDocuments({ userId: user._id });

    // If at limit, remove oldest session
    if (activeSessions >= maxAllowed) {
      const oldest = await Session.findOne({ userId: user._id }).sort({ createdAt: 1 });
      if (oldest) await Session.deleteOne({ _id: oldest._id });
    }

    await Session.create({
      userId: user._id,
      token,
      deviceInfo: deviceInfo.substring(0, 500),
      ipAddress: ipAddress.substring(0, 50),
      lastActive: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
