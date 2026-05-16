import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    const adminEmail = "vibestageofficial@gmail.com";
    const adminPassword = "Devansh03Pratap13";
    const adminName = "VibeStage Admin";

    // Check if admin exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      return NextResponse.json(
        { success: true, message: "Admin already exists" },
        { status: 200 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      phone: "",
      location: "",
    });

    return NextResponse.json(
      { success: true, message: "Admin created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}