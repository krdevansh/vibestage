import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vibestage_dev_secret";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp, type, ...signupData } = await req.json();

    if (!email || !otp || !type) {
      return NextResponse.json(
        { success: false, error: "Email, OTP and type are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email, otp });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP has expired" },
        { status: 400 }
      );
    }

    if (type === "signup") {
      if (!signupData.name || !signupData.password || !signupData.role) {
        return NextResponse.json(
          { success: false, error: "Missing signup data" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(signupData.password, salt);

      await User.findByIdAndUpdate(user._id, {
        name: signupData.name,
        password: hashedPassword,
        role: signupData.role === "artist" ? "artist" : "event_partner",
        isEmailVerified: true,
        otp: "",
        otpExpires: null,
      });

      if (signupData.role === "artist" && signupData.genre && signupData.location) {
        await Artist.create({
          userId: user._id,
          name: signupData.name,
          genre: signupData.genre,
          location: signupData.location,
          price: signupData.price || 15000,
          image: signupData.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
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

      const updatedUser = await User.findById(user._id);
      const token = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            token,
            user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
          },
        },
        { status: 201 }
      );
    } else if (type === "forgot-verify") {
      await User.findByIdAndUpdate(user._id, {
        otp: "verified",
        otpExpires: null,
      });
      
      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
      });
    } else if (type === "forgot-reset") {
      const verifiedUser = await User.findOne({ email, otp: "verified" });
      
      if (!verifiedUser) {
        return NextResponse.json(
          { success: false, error: "Please verify OTP first" },
          { status: 400 }
        );
      }

      if (!signupData.newPassword) {
        return NextResponse.json(
          { success: false, error: "New password is required" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(signupData.newPassword, salt);

      await User.findByIdAndUpdate(verifiedUser._id, {
        password: hashedPassword,
        otp: "",
        otpExpires: null,
      });

      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    } else if (type === "forgot") {
      if (!signupData.newPassword) {
        return NextResponse.json(
          { success: false, error: "New password is required" },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(signupData.newPassword, salt);

      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        otp: "",
        otpExpires: null,
      });

      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}