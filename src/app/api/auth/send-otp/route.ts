import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Artist from "@/models/Artist";
import { sendEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json(
        { success: false, error: "Email and type are required" },
        { status: 400 }
      );
    }

    if (type === "signup") {
      const existing = await User.findOne({ email });
      if (existing) {
        if (existing.isDeleted) {
          await User.findByIdAndDelete(existing._id);
          await Artist.findOneAndDelete({ userId: existing._id });
        } else {
          return NextResponse.json(
            { success: false, error: "Email already registered" },
            { status: 400 }
          );
        }
      }
    } else if (type === "forgot") {
      const existing = await User.findOne({ email });
      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Email not registered" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === "signup") {
      await User.create({
        name: "",
        email,
        password: "",
        otp,
        otpExpires,
        isEmailVerified: false,
      });
    } else {
      await User.findOneAndUpdate(
        { email },
        { otp, otpExpires },
        { new: true }
      );
    }

    const emailSubject = type === "signup" 
      ? "Verify your VibeStage account" 
      : "Reset your VibeStage password";
    
    const emailHtml = type === "signup"
      ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff7a18;">Welcome to VibeStage!</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #ff7a18; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>`
      : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff7a18;">Reset your VibeStage password</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="color: #ff7a18; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>`;

    await sendEmail(email, emailSubject, emailHtml);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("POST /api/auth/send-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}