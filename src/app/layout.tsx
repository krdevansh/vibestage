import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeStage — Live Music Booking Platform",
  description:
    "Book incredible live artists for your events. Premium music booking platform connecting event organizers with top-tier performers.",
  keywords: [
    "live music",
    "booking",
    "artists",
    "events",
    "concerts",
    "performers",
  ],
  openGraph: {
    title: "VibeStage — Live Music Booking Platform",
    description:
      "Book incredible live artists for your events. Premium music booking experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen bg-brand-bg">
        {children}
      </body>
    </html>
  );
}
