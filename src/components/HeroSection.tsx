"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [showBookButton, setShowBookButton] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "event_partner" || user.role === "admin") {
        setShowBookButton(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      glowRef.current.style.background = `radial-gradient(600px circle at ${x}% ${y}%, rgba(255,122,24,0.07), transparent 60%)`;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Background Layers ── */}
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Top spotlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-glow-orange opacity-40 animate-pulse-glow blur-3xl" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[400px] bg-glow-pink opacity-25 animate-pulse-glow blur-3xl" style={{ animationDelay: "1.5s" }} />

      {/* Spotlight cone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[40vh]" style={{
        background: "linear-gradient(180deg, rgba(255,122,24,0.6) 0%, transparent 100%)",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-brand-orange shadow-[0_0_30px_10px_rgba(255,122,24,0.6)]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Mouse-follow glow */}
      <div ref={glowRef} className="absolute inset-0 transition-all duration-700 pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-brand-orange/40 animate-float" />
      <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-brand-pink/40 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[40%] left-[80%] w-1 h-1 rounded-full bg-brand-orange/30 animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute top-[75%] left-[25%] w-2.5 h-2.5 rounded-full bg-brand-pink/20 animate-float" style={{ animationDelay: "1s" }} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8 opacity-0 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
            Now Booking Artists Worldwide
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-6 opacity-0 animate-slide-up">
          <span className="block text-white">LIVE MUSIC.</span>
          <span className="block gradient-text mt-1">REAL VIBES.</span>
        </h1>

        {/* Sub text */}
        <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10 opacity-0 animate-fade-in animate-delay-300">
          The premium platform connecting event organizers with
          extraordinary live performers. One stage at a time.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in animate-delay-500">
          {showBookButton && (
            <Link href="/artists" className="btn-primary text-lg !px-10 !py-4" id="hero-cta-primary">
              <span>Book Artists</span>
            </Link>
          )}
          <Link href="/login?role=artist" className="btn-secondary text-lg !px-10 !py-4" id="hero-cta-artist">
            <span>Login as Artist</span>
          </Link>
          <Link href="/login?role=partner" className="btn-secondary text-lg !px-10 !py-4" id="hero-cta-partner">
            <span>Login as Organizer</span>
          </Link>
        </div>

      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-bg to-transparent" />
    </section>
  );
}
