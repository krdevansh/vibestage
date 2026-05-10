import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";
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

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { file, folder, type } = body;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const folderMap: Record<string, string> = {
      profile: "vibestage/profiles",
      gallery: "vibestage/gallery",
      cover: "vibestage/covers",
      video: "vibestage/videos",
      logo: "vibestage/logos",
      event: "vibestage/events",
    };

    const uploadFolder = folderMap[folder] || "vibestage";

    const result = await uploadToCloudinary(file, uploadFolder);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}