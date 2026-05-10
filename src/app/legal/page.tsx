"use client";

import Link from "next/link";
import { FileText, Shield, Cookie, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LEGAL_PAGES = [
  {
    icon: FileText,
    title: "Terms of Service",
    description: "The rules and guidelines for using VibeStage platform.",
    href: "/terms",
    color: "brand-orange",
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information.",
    href: "/privacy",
    color: "brand-pink",
  },
  {
    icon: Cookie,
    title: "Cookie Policy",
    description: "Information about the cookies we use and their purposes.",
    href: "/cookies",
    color: "brand-orange",
  },
];

export default function LegalPage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-glow-orange opacity-15 blur-3xl" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-glow-pink opacity-10 blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/5 mb-8">
            <Shield className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-medium text-brand-orange uppercase tracking-widest">Legal</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
            <span className="text-white">Legal </span>
            <span className="gradient-text">Overview</span>
          </h1>
          
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Transparency matters. Learn about our policies, your rights, and how we protect your data.
          </p>
        </div>
      </section>

      <section className="relative py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 gap-6">
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page.title}
                href={page.href}
                className="glass-card p-8 flex items-center gap-6 group hover:border-white/20 transition-all duration-300"
                id={`legal-${page.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${page.color}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <page.icon className={`w-7 h-7 text-${page.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                    {page.title}
                  </h3>
                  <p className="text-white/40">{page.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass-card p-8 md:p-10">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Questions?</h2>
            <p className="text-white/40 mb-6">
              If you have any questions about our legal policies or need clarification, 
              please don&apos;t hesitate to contact us.
            </p>
            <a
              href="mailto:vibestageofficial@gmail.com"
              className="btn-primary inline-flex items-center gap-2"
              id="legal-contact"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}