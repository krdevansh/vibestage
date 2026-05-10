"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ArtistCard from "./ArtistCard";

interface Artist {
  _id: string;
  name: string;
  genre: string;
  image: string;
  rating: number;
  location: string;
  price?: number;
}

export default function ArtistsSection() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "event_partner" || user.role === "admin") {
        setShowPrice(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch("/api/artists");
        const data = await res.json();
        if (data.success) {
          setArtists(data.data);
        } else {
          setError("Failed to load artists");
        }
      } catch {
        setError("Failed to load artists");
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const getUniqueGenres = () => {
    const genres = new Set(artists.map((a) => a.genre).filter(Boolean));
    return ["All", ...Array.from(genres)];
  };

  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredArtists = selectedGenre === "All" 
    ? artists 
    : artists.filter((a) => a.genre === selectedGenre);

  return (
    <section id="artists" className="relative py-28 md:py-36">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-orange opacity-10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange/80 mb-4">Featured Talent</p>
          <h2 className="section-heading">
            <span className="text-white">Discover </span>
            <span className="gradient-text">Artists</span>
          </h2>
          <p className="section-subtext mx-auto mt-5">Real performers ready to set your stage on fire.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 glass-card">
            <p className="text-red-400">{error}</p>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-white/50 text-lg">No artists registered yet</p>
            <Link href="/join" className="btn-primary inline-block mt-4">
              Register as an Artist
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {getUniqueGenres().map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedGenre === genre
                      ? "bg-brand-gradient text-white shadow-glow-sm"
                      : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:border-white/20 hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredArtists.slice(0, 6).map((artist, index) => (
                <ArtistCard key={artist._id} artist={artist} index={index} showPrice={showPrice} />
              ))}
            </div>
            <div className="text-center mt-14">
              <Link href="/artists" className="btn-secondary">
                View All Artists →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}