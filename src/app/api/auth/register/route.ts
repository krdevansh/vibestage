import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role, genre, location, price, image } = await req.json();

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role (default to event_partner)
    const userRole = role || "event_partner";

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // If registering as artist, create artist profile
    if (userRole === "artist" && genre && location) {
      await Artist.create({
        userId: user._id,
        name,
        genre,
        location,
        price: price || 15000,
        image: image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
        rating: 0,
        email,
        bio: "",
        phone: "",
        languages: ["English", "Hindi"],
        socialLinks: { instagram: "", youtube: "", website: "" },
        availableDates: [],
        isAvailable: true,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
