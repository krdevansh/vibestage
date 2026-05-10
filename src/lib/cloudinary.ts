import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  folder: string = "vibestage"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { quality: "auto:good", fetch_format: "auto" },
      ],
    });
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}

export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    const publicId = url.split("/").pop()?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`vibestage/${publicId}`);
    }
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

export default cloudinary;