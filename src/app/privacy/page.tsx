"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdateDate = "May 7, 2026";

export default function PrivacyPage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-pink opacity-10 blur-3xl" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-pink/80 mb-4">Legal</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-white/40">Last updated: {lastUpdateDate}</p>
          </div>
        </div>
      </section>

      <section className="relative py-12 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-white/50 leading-relaxed">
                At VibeStage, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">2. Data We Collect</h2>
              <p className="text-white/50 leading-relaxed mb-4">We collect the following types of information:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Personal Information:</strong> Name, email address, phone number, and physical address</li>
                <li><strong className="text-white">Account Data:</strong> Username, password, and profile information</li>
                <li><strong className="text-white">Booking Information:</strong> Event details, dates, locations, and payment information</li>
                <li><strong className="text-white">Artist Data:</strong> Professional biography, portfolio, genre, pricing, and availability</li>
                <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">3. How We Use Your Data</h2>
              <p className="text-white/50 leading-relaxed mb-4">We use your information to:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>Provide and improve our services</li>
                <li>Process your bookings and payments</li>
                <li>Connect you with artists or event organizers</li>
                <li>Send you important updates and notifications</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">4. Data Sharing</h2>
              <p className="text-white/50 leading-relaxed mb-4">We may share your information with:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Artists:</strong> Event organizers may see artist profile information</li>
                <li><strong className="text-white">Event Organizers:</strong> Artists may see booking and contact details</li>
                <li><strong className="text-white">Service Providers:</strong> Payment processors, hosting providers, and support tools</li>
                <li><strong className="text-white">Legal Authorities:</strong> When required by law or to protect rights</li>
              </ul>
              <p className="text-white/50 leading-relaxed mt-4">
                <strong className="text-white">We do NOT sell your personal data to third parties.</strong> Your information is never traded, rented, or sold for marketing purposes.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">5. Data Security</h2>
              <p className="text-white/50 leading-relaxed mb-4">We implement industry-standard security measures:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure hashing for passwords</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Secure cloud hosting infrastructure</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">6. Your Rights</h2>
              <p className="text-white/50 leading-relaxed mb-4">You have the right to:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data</li>
                <li><strong className="text-white">Portability:</strong> Request your data in a portable format</li>
                <li><strong className="text-white">Opt-out:</strong>Unsubscribe from marketing communications</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">7. Data Retention</h2>
              <p className="text-white/50 leading-relaxed">
                We retain your personal data for as long as your account is active or as needed to provide you services. After account deletion, we may retain certain information for legal, accounting, or archival purposes. You can request deletion of your account at any time.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-white/50 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the platform after such changes constitutes acceptance.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">9. Contact Us</h2>
              <p className="text-white/50 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:vibestageofficial@gmail.com" className="text-brand-pink hover:underline">vibestageofficial@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <Link href="/legal" className="btn-secondary">
              Back to Legal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}