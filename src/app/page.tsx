import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ArtistsSection from "@/components/ArtistsSection";
import HowItWorks from "@/components/HowItWorks";
import BookingsSection from "@/components/BookingsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <ArtistsSection />
      <HowItWorks />
      <BookingsSection />
      <Footer />
    </main>
  );
}
