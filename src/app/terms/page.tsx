"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdateDate = "May 7, 2026";

export default function TermsPage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-orange opacity-10 blur-3xl" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange/80 mb-4">Legal</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Terms of Service</span>
            </h1>
            <p className="text-white/40">Last updated: {lastUpdateDate}</p>
          </div>
        </div>
      </section>

      <section className="relative py-12 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/50 leading-relaxed">
                By accessing and using VibeStage (&quot;the Platform&quot;), you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using VibeStage&apos;s services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">2. User Obligations</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                All users must provide accurate, complete, and current information during registration and booking. You agree to:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>Provide truthful and accurate information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not share your account with others</li>
                <li>Not use the platform for any illegal activities</li>
                <li>Respect the rights of other users and artists</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">3. Platform Fees & Commission</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                VibeStage charges a platform service fee of 10% on all bookings. This fee covers:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>Payment processing</li>
                <li>Customer support services</li>
                <li>Platform maintenance and development</li>
                <li>Artist verification and screening</li>
              </ul>
              <p className="text-white/50 leading-relaxed mt-4">
                All displayed prices include this platform fee. Artists receive their base fee minus the platform charge.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">4. Bookings & Availability</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                All bookings are subject to artist availability. When you book an artist:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>The booking is confirmed only after payment is processed</li>
                <li>Artists reserve the right to decline bookings</li>
                <li>Cancellation policies vary by artist</li>
                <li>Rescheduling may be possible based on artist availability</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">5. Prohibited Activities</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>Fraud or misrepresentation of information</li>
                <li>Attempting to circumvent platform fees</li>
                <li>Harassment or abuse of artists or other users</li>
                <li>Posting harmful or inappropriate content</li>
                <li>Attempting to gain unauthorized access to the platform</li>
                <li>Using the platform for any illegal purpose</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-white/50 leading-relaxed">
                All content on VibeStage, including but not limited to logos, designs, text, graphics, and software, is the property of VibeStage or its licensors. You may not copy, reproduce, distribute, or create derivative works from any content without prior written consent.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-white/50 leading-relaxed">
                VibeStage shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. Our total liability shall not exceed the amount of fees paid by you in the twelve (12) months preceding the claim.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">8. Modification of Terms</h2>
              <p className="text-white/50 leading-relaxed">
                VibeStage reserves the right to modify these terms at any time. We will provide notice of material changes via the platform. Your continued use of VibeStage after such modifications constitutes acceptance of the updated terms.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">9. Termination</h2>
              <p className="text-white/50 leading-relaxed">
                VibeStage may terminate or suspend your account at any time for violation of these terms. Upon termination, you will lose access to the platform and any pending bookings may be cancelled.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">10. Contact Information</h2>
              <p className="text-white/50 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:vibestageofficial@gmail.com" className="text-brand-orange hover:underline">vibestageofficial@gmail.com</a>
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