import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "vibestageofficial@gmail.com";
const ADMIN_PASSWORD = "Devansh03Pratap13";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const secret = req.headers.get("x-admin-secret");
    if (secret !== "vibestage_admin_seed_2024") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      return NextResponse.json({ success: true, message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin created successfully",
      admin: { id: admin._id, email: admin.email, role: admin.role }
    }, { status: 201 });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json({ success: false, error: "Failed to create admin" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const admin = await User.findOne({ email: ADMIN_EMAIL }).select("-password");
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to check admin" }, { status: 500 });
  }
}