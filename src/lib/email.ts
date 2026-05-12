let nodemailer: any = null;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.log("nodemailer not installed - OTP will be logged to console");
}

let transporter: any = null;
if (nodemailer && process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    const plainText = html.replace(/<[^>]*>/g, '');
    console.log(`\n========== OTP EMAIL (DEV MODE) ==========\nTo: ${to}\nSubject: ${subject}\nBody: ${plainText.substring(0, 200)}...\n============================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "VibeStage <noreply@vibestage.com>",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}