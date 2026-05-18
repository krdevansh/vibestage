import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
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

// GET /api/sessions - list active sessions
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    // Admin can view any user's sessions; regular users can only view their own
    if (targetUserId && user.role === "admin") {
      const sessions = await Session.find({ userId: targetUserId }).sort({ createdAt: -1 });
      const targetUser = await User.findById(targetUserId).select("name email role");
      return NextResponse.json({ success: true, data: { sessions, user: targetUser } });
    }

    const sessions = await Session.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// DELETE /api/sessions - terminate a session (logout from device)
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing sessionId" }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    // Admin can delete any session; users can delete their own
    if (user.role !== "admin" && session.userId.toString() !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await Session.deleteOne({ _id: sessionId });

    // Check if the deleted session was the current device (token matches)
    const requestToken = request.headers.get("authorization")?.replace("Bearer ", "");
    const isCurrentSession = requestToken && session.token === requestToken;

    return NextResponse.json({
      success: true,
      message: "Session terminated",
      currentSessionTerminated: isCurrentSession
    });
  } catch (error) {
    console.error("DELETE /api/sessions error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete session" }, { status: 500 });
  }
}
