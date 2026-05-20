"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistCard, { Artist } from "@/components/ArtistCard";

const GENRES = ["All", "Electronic / EDM", "Indie Pop", "Rock / Blues", "R&B / Soul", "House / Techno", "Folk / Acoustic"];
const LOCATIONS = ["All", "Mumbai", "Delhi", "Bangalore", "Pune", "Goa", "Jaipur"];

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
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
        const res = await fetch("/api/artists?verified=true");
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

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || artist.genre.includes(selectedGenre);
    const matchesLocation = selectedLocation === "All" || artist.location === selectedLocation;
    return matchesSearch && matchesGenre && matchesLocation;
  });

  return (
    <main className="relative">
      <Navbar />

      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-glow-orange opacity-10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange/80 mb-4">Browse Talent</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              <span className="text-white">Find </span>
              <span className="gradient-text">Artists</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Search and book talented performers for your events.
            </p>
          </div>

          <div className="glass-card p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search artists by name or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/30 focus:border-brand-orange/50 focus:outline-none transition-colors"
                />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 focus:border-brand-orange/50 focus:outline-none transition-colors cursor-pointer"
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre} className="bg-brand-bg">
                    {genre}
                  </option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 focus:border-brand-orange/50 focus:outline-none transition-colors cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-brand-bg">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-white/40">
              Showing <span className="text-white font-semibold">{filteredArtists.length}</span> artists
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 glass-card">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist, index) => (
                <ArtistCard key={artist._id} artist={artist} index={index} showPrice={showPrice} />
              ))}
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <p className="text-white/50 text-lg mb-4">No artists registered yet</p>
              <a href="/join" className="btn-secondary inline-block">
                Register as an Artist
              </a>
            </div>
          ) : (
            <div className="text-center py-20 glass-card">
              <p className="text-white/50 text-lg mb-4">No artists found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("All");
                  setSelectedLocation("All");
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}