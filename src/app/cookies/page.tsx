"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdateDate = "May 7, 2026";

export default function CookiePage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-orange opacity-10 blur-3xl" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange/80 mb-4">Legal</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black mb-4">
              <span className="gradient-text">Cookie Policy</span>
            </h1>
            <p className="text-white/40">Last updated: {lastUpdateDate}</p>
          </div>
        </div>
      </section>

      <section className="relative py-12 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">1. What Are Cookies?</h2>
              <p className="text-white/50 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They help the website recognize your device and remember information about your visit, such as your preferred language and other settings. This can make your next visit easier and the site more useful to you.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">2. How We Use Cookies</h2>
              <p className="text-white/50 leading-relaxed mb-4">VibeStage uses cookies for the following purposes:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Essential Cookies:</strong> Required for login sessions and maintaining security</li>
                <li><strong className="text-white">Authentication:</strong> To verify your identity and keep you logged in</li>
                <li><strong className="text-white">Preferences:</strong> To remember your settings and preferences</li>
                <li><strong className="text-white">Analytics:</strong> To understand how visitors use our platform</li>
                <li><strong className="text-white">Performance:</strong> To monitor and analyze the performance of our services</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">3. Types of Cookies We Use</h2>
              <p className="text-white/50 leading-relaxed mb-4"><strong className="text-white">Session Cookies:</strong></p>
              <p className="text-white/40 leading-relaxed mb-4 ml-4">
                These are temporary cookies that expire when you close your browser. They are essential for basic site functionality, including logging in and completing bookings.
              </p>
              <p className="text-white/50 leading-relaxed mb-4"><strong className="text-white">Persistent Cookies:</strong></p>
              <p className="text-white/40 leading-relaxed mb-4 ml-4">
                These remain on your device for a set period or until you delete them. We use them to remember your preferences and provide a more personalized experience.
              </p>
              <p className="text-white/50 leading-relaxed mb-4"><strong className="text-white">Analytics Cookies:</strong></p>
              <p className="text-white/40 leading-relaxed ml-4">
                Third-party analytics tools help us understand how our platform is used. These cookies collect anonymous information about visitor behavior to help us improve our services.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">4. Managing Cookies</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                You can control and manage cookies in your browser settings. Here&apos;s how:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                <li><strong className="text-white">Incognito/Private Mode:</strong> Use private browsing to avoid stored cookies</li>
                <li><strong className="text-white">Third-Party Opt-outs:</strong> You can opt out of specific third-party analytics</li>
              </ul>
              <p className="text-white/50 leading-relaxed mt-4">
                Please note that blocking certain cookies may impact site functionality. Some features may not work properly without cookies enabled.
              </p>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">5. Cookie Purposes</h2>
              <p className="text-white/50 leading-relaxed mb-4">We use cookies to improve your experience by:</p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li>Keeping you signed in during your session</li>
                <li>Remembering your language and display preferences</li>
                <li>Analyzing which pages are most visited</li>
                <li>Identifying issues and improving the platform</li>
                <li>Providing relevant content and recommendations</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">6. Third-Party Cookies</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                Some cookies are placed by third-party services that appear on our platform. We don&apos;t control these cookies. The third parties include:
              </p>
              <ul className="text-white/40 space-y-2 list-disc list-inside ml-4">
                <li><strong className="text-white">Analytics Providers:</strong> Help us understand platform usage</li>
                <li><strong className="text-white">Payment Processors:</strong> Securely process transactions</li>
                <li><strong className="text-white">Content Providers:</strong> Deliver embedded content</li>
              </ul>
            </div>

            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">7. Updates to This Policy</h2>
              <p className="text-white/50 leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of VibeStage after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-xl font-display font-bold text-white mb-4">8. Contact Us</h2>
              <p className="text-white/50 leading-relaxed">
                If you have questions about our use of cookies, please contact us at{" "}
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