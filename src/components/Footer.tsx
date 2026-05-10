"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-brand-surface/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-end gap-[3px] h-5">
                {[0, 150, 80, 200].map((delay, i) => (
                  <div
                    key={i}
                    className="w-[2.5px] rounded-full bg-gradient-to-t from-brand-orange to-brand-pink animate-equalizer"
                    style={{ animationDelay: `${delay}ms`, height: `${10 + i * 3}px` }}
                  />
                ))}
              </div>
              <span className="text-lg font-display font-bold">
                <span className="gradient-text">Vibe</span>
                <span className="text-white">Stage</span>
              </span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed max-w-xs">
              The premium live music booking platform. Connecting artists with event organizers worldwide.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a href="mailto:vibestageofficial@gmail.com" className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-brand-orange hover:border-brand-orange/30 transition-all" aria-label="Email" id="footer-email">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
              <a href="https://instagram.com/vibestageofficial" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-brand-pink hover:border-brand-pink/30 transition-all" aria-label="Instagram" id="footer-instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/artists" className="text-sm text-white/30 hover:text-white/70 transition-colors">Browse Artists</Link></li>
              <li><Link href="/login?role=partner" className="text-sm text-white/30 hover:text-white/70 transition-colors">Join as Organizer</Link></li>
              <li><Link href="/about" className="text-sm text-white/30 hover:text-white/70 transition-colors">About Us</Link></li>
              <li><Link href="/legal" className="text-sm text-white/30 hover:text-white/70 transition-colors">Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Artists</h4>
            <ul className="space-y-3">
              <li><Link href="/login?role=artist" className="text-sm text-white/30 hover:text-white/70 transition-colors">Artist Login</Link></li>
              <li><Link href="/artist/dashboard" className="text-sm text-white/30 hover:text-white/70 transition-colors">Dashboard</Link></li>
              <li><a href="mailto:vibestageofficial@gmail.com" className="text-sm text-white/30 hover:text-white/70 transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="mailto:vibestageofficial@gmail.com" className="text-sm text-white/30 hover:text-white/70 transition-colors">Contact</a></li>
              <li><Link href="/terms" className="text-sm text-white/30 hover:text-white/70 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/30 hover:text-white/70 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-sm text-white/30 hover:text-white/70 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} VibeStage. All rights reserved.
          </p>
          <p className="text-xs text-white/20">
            Built with 🎵 for the music community
          </p>
        </div>
      </div>
    </footer>
  );
}
