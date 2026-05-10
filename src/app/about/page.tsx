"use client";

import Link from "next/link";
import { Music2, Target, Eye, Heart, Users, Award, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VALUES = [
  {
    icon: Music2,
    title: "Quality First",
    description: "Every artist on VibeStage is verified for talent and professionalism.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "We build relationships between artists and event organizers for lasting partnerships.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every booking, every performance, every experience.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Live music should be accessible to everyone, everywhere.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative">
      <Navbar />
      
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-glow-orange opacity-15 blur-3xl" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-glow-pink opacity-10 blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-orange/20 bg-brand-orange/5 mb-8">
            <Heart className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-medium text-brand-orange uppercase tracking-widest">About Us</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
            <span className="text-white">What is </span>
            <span className="gradient-text">VibeStage?</span>
          </h1>
          
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A premium platform connecting event organizers with talented musicians, creating unforgettable live experiences across India.
          </p>
        </div>
      </section>

      <section className="relative py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 md:p-10">
              <Target className="w-10 h-10 text-brand-orange mb-6" />
              <h2 className="text-2xl font-display font-bold text-white mb-4">Our Mission</h2>
              <p className="text-white/40 leading-relaxed">
                To make live entertainment accessible and easy to book. We believe every event deserves 
                incredible music, and every artist deserves to be discovered. Our mission is to bridge 
                the gap between talented performers and event organizers, creating a seamless booking 
                experience that benefits everyone.
              </p>
            </div>
            
            <div className="glass-card p-8 md:p-10">
              <Eye className="w-10 h-10 text-brand-pink mb-6" />
              <h2 className="text-2xl font-display font-bold text-white mb-4">Our Vision</h2>
              <p className="text-white/40 leading-relaxed">
                To become India&apos;s leading live performance marketplace. We envision a future where 
                finding and booking talented artists for any event - from intimate weddings to grand corporate 
                functions - is as easy as a few clicks. We&apos;re building the infrastructure that supports 
                artists&apos; careers while helping organizers create memorable experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-heading">
              <span className="text-white">Our </span>
              <span className="gradient-text">Values</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="glass-card p-6 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-pink/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-7 h-7 text-brand-orange" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="section-heading mb-6">
            <span className="text-white">Join the </span>
            <span className="gradient-text">VibeStage Story</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 leading-relaxed">
            Whether you&apos;re an artist looking to share your music with the world or an event organizer 
            seeking the perfect performer, VibeStage is your trusted partner in creating unforgettable live moments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/join" className="btn-primary" id="about-join-artist">
              <span>Join as Artist</span>
            </Link>
            <Link href="/artists" className="btn-secondary" id="about-browse-artists">
              Browse Artists
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}