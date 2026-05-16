import nodemailer from "nodemailer";

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
}) : null;

console.log("Email config:", {
  hasSMTP: !!process.env.SMTP_HOST,
  smtpHost: process.env.SMTP_HOST,
  smtpUser: process.env.SMTP_USER ? "set" : "not set",
  smtpPass: process.env.SMTP_PASS ? "set" : "not set",
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    const plainText = html.replace(/<[^>]*>/g, '');
    console.log(`\n========== OTP EMAIL (DEV MODE) ==========\nTo: ${to}\nSubject: ${subject}\nBody: ${plainText.substring(0, 200)}...\n============================================\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "VibeStage <noreply@vibestage.com>",
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Email sending error:", error.message || error);
    return false;
  }
}