"use client";

import Link from "next/link";
import { Mic2, DollarSign, Zap, Users, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BENEFITS = [
  {
    icon: Zap,
    title: "Get Booked for Events",
    description: "Access thousands of event opportunities across weddings, corporate events, and private parties.",
  },
  {
    icon: DollarSign,
    title: "Set Your Own Price",
    description: "You control your rates. No one tells you what to charge. Keep what you earn minus a small platform fee.",
  },
  {
    icon: Users,
    title: "No Upfront Cost",
    description: "Join free. We don't charge any registration or membership fees. We only make money when you do.",
  },
];

const STEPS = [
  { number: 1, title: "Create Profile", description: "Sign up and build your artist profile with photos, bio, and genre." },
  { number: 2, title: "Set Your Price", description: "Decide your performance fee. We calculate platform fees transparently." },
  { number: 3, title: "Start Getting Bookings", description: "Get discovered by event organizers and start performing." },
];

export default function JoinAsArtistPage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-glow-orange opacity-15 blur-3xl" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-glow-pink opacity-10 blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/5 mb-8">
            <Mic2 className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-medium text-brand-orange uppercase tracking-widest">Join as Artist</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="text-white">Perform. Earn.</span>
            <br />
            <span className="gradient-text">Grow with VibeStage</span>
          </h1>
          
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join India&apos;s fastest-growing live music platform. Turn your passion into a career. Get paid to do what you love.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=artist" className="btn-primary text-lg !px-10 !py-4" id="cta-signup-artist">
              <span>Signup as Artist</span>
            </Link>
            <Link href="/artists" className="btn-secondary text-lg !px-10 !py-4" id="cta-browse-artists">
              Browse Artists
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">
              <span className="text-white">Why </span>
              <span className="gradient-text">Join VibeStage?</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <div key={benefit.title} className="glass-card p-8 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-pink/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7 text-brand-orange" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-white/40 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">
              <span className="text-white">How </span>
              <span className="gradient-text">It Works</span>
            </h2>
            <p className="text-white/40 mt-4">Three simple steps to start your journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-brand-orange/30 to-brand-pink/30" />
                )}
                <div className="relative z-10 w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <span className="text-2xl font-display font-black text-white">{step.number}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass-card p-10 md:p-14 border-brand-orange/20">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">Ready to Share Your Music?</h2>
            <p className="text-white/40 mb-8">Join thousands of artists already on VibeStage. It takes less than 5 minutes to create your profile.</p>
            <Link href="/login?role=artist" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2" id="cta-final-signup">
              <span>Create Artist Profile</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}