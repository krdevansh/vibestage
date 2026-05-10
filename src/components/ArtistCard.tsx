"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface Artist {
  _id: string;
  name: string;
  genre: string;
  price?: number;
  image: string;
  rating: number;
  location: string;
}

interface ArtistCardProps {
  artist: Artist;
  index: number;
  showPrice?: boolean;
}

export default function ArtistCard({ artist, index, showPrice = false }: ArtistCardProps) {
  const router = useRouter();
  const [canBook, setCanBook] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "event_partner" || user.role === "admin") {
        setCanBook(true);
      }
    }
  }, []);

  const handleBookClick = () => {
    if (!canBook) {
      router.push("/login?role=partner");
    }
  };

  return (
    <div
      className="glass-card group cursor-pointer opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: "forwards" }}
      id={`artist-card-${artist._id}`}
    >
      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,122,24,0.15), rgba(255,0,88,0.1))",
        }}
      />

      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={artist.image}
          alt={artist.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />

        {/* Genre badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/10 text-white/80">
          {artist.genre}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange/20 backdrop-blur-md border border-brand-orange/20">
          <svg className="w-3.5 h-3.5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-brand-orange">{artist.rating}</span>
        </div>

        {/* Equalizer animation on hover */}
        <div className="absolute bottom-4 right-4 flex items-end gap-[2px] h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[0, 200, 100, 300, 150].map((delay, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-brand-orange animate-equalizer"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-display font-bold text-white group-hover:gradient-text transition-all duration-300">
          {artist.name}
        </h3>
        <p className="text-sm text-white/40 mt-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {artist.location}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          {showPrice && artist.price && (
            <div>
              <span className="text-xl font-bold gradient-text">₹{artist.price.toLocaleString()}</span>
              <span className="text-xs text-white/30 ml-1">/ show</span>
            </div>
          )}
          {!showPrice && (
            <div className="text-sm text-white/40">
              <span className="text-white/60">{artist.location}</span>
            </div>
          )}
          {canBook ? (
            <button
              className="px-4 py-2 rounded-full text-xs font-semibold text-white
                         bg-white/[0.06] border border-white/10
                         hover:bg-brand-gradient hover:border-transparent
                         transition-all duration-300 hover:shadow-glow-sm"
              id={`book-${artist._id}`}
            >
              Book Now
            </button>
          ) : (
            <button
              onClick={handleBookClick}
              className="px-4 py-2 rounded-full text-xs font-semibold text-brand-orange
                         bg-brand-orange/10 border border-brand-orange/20
                         hover:bg-brand-orange/20 transition-all duration-300"
              id={`book-${artist._id}`}
            >
              Sign in to Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
