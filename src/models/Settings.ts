import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  platformUpiId: string;
  platformUpiQrCode: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    platformUpiId: { type: String, default: "" },
    platformUpiQrCode: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
