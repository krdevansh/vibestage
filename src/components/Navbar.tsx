"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Artists", href: "/artists" },
  { label: "About", href: "/about" },
  { label: "Legal", href: "/legal" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-bg/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
          {/* Animated equalizer icon */}
          <div className="flex items-end gap-[3px] h-6">
            {[0, 150, 80, 200].map((delay, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-brand-orange to-brand-pink animate-equalizer"
                style={{
                  animationDelay: `${delay}ms`,
                  height: `${12 + i * 4}px`,
                }}
              />
            ))}
          </div>
          <span className="text-xl font-display font-bold tracking-tight">
            <span className="gradient-text">Vibe</span>
            <span className="text-white">Stage</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link"
              id={`nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login?role=partner" className="btn-primary !py-2.5 !px-5 !text-sm" id="nav-cta-partner">
            <span>Book Now</span>
          </Link>
          <Link href="/login?role=artist" className="btn-secondary !py-2.5 !px-5 !text-sm" id="nav-cta-artist">
            <span>Login as Artist</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden relative z-50 text-white/80 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-brand-bg/95 backdrop-blur-2xl"
          onClick={() => setMobileOpen(false)}
        />

        {/* Links */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-3xl font-display font-bold text-white/80 hover:text-white transition-all duration-300 ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 80 + 200}ms` }}
              id={`mobile-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-4 w-full max-w-xs">
            <Link
              href="/login?role=partner"
              onClick={() => setMobileOpen(false)}
              className={`btn-primary !py-3 !text-sm text-center transition-all duration-300 ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "520ms" }}
            >
              Login as Organizer
            </Link>
            <Link
              href="/login?role=artist"
              onClick={() => setMobileOpen(false)}
              className={`btn-secondary !py-3 !text-sm text-center transition-all duration-300 ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "580ms" }}
            >
              Login as Artist
            </Link>
            <Link
              href="/login?role=admin"
              onClick={() => setMobileOpen(false)}
              className={`text-sm text-white/40 hover:text-white text-center transition-all duration-300 ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "640ms" }}
              id="mobile-nav-cta"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
