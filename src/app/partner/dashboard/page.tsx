"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, User, Music, Calendar, Bell, 
  ChevronRight, LogOut, Check, X, Search, MapPin, Eye, Star, Settings, Upload, Menu
} from "lucide-react";
import ArtistCard, { Artist } from "@/components/ArtistCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Booking {
  _id: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  proposedDates: string[];
  proposedVenues: string[];
  acceptedDate: string;
  acceptedVenue: string;
  finalPrice: number;
  basePrice: number;
  status: string;
  paymentStatus: string;
  paymentType: string;
  organizerPaidAdmin: boolean;
  adminPaidArtist: boolean;
  advanceAmount: number;
  artistName: string;
  artistId: { _id: string; name: string; genre: string[]; image: string; location: string; upiId: string; upiQrCode: string };
  artistImage: string;
  paymentProof: {
    screenshot: string;
    utr: string;
    paidAt: string;
  };
}

interface DashboardStats {
  totalBookings: number;
  upcomingEvents: number;
  totalSpent: number;
}

const ADMIN_COMMISSION_PERCENT = 30;

function calculateFinalPrice(basePrice: number) {
  return Math.round(basePrice * (1 + ADMIN_COMMISSION_PERCENT / 100));
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalBookings: 0, upcomingEvents: 0, totalSpent: 0 });
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    artistId: "", eventName: "", eventType: "Private Event", dates: ["", "", "", "", ""], venues: ["", "", "", "", ""], notes: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", location: "", companyName: "", profileImage: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const profileFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [payingBooking, setPayingBooking] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [platformSettings, setPlatformSettings] = useState({ platformUpiId: "", platformUpiQrCode: "" });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [paymentProofForm, setPaymentProofForm] = useState({ screenshot: "", utr: "", paidAt: "", paymentType: "full" });
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState<string | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const proofFileRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const bookingsRes = await fetch("/api/partner/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data);
        const total = bookingsData.data.reduce((sum: number, b: Booking) => sum + b.finalPrice, 0);
        const upcoming = bookingsData.data.filter((b: Booking) => b.status === "accepted" || b.status === "confirmed" || b.status === "awaiting_confirmation");
        setStats({
          totalBookings: bookingsData.data.length,
          upcomingEvents: upcoming.length,
          totalSpent: total
        });
      }

      const artistsRes = await fetch("/api/artists");
      const artistsData = await artistsRes.json();
      if (artistsData.success) {
        setArtists(artistsData.data);
      }

      // Fetch platform payment settings
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setPlatformSettings(settingsData.data);
      }

      // Fetch partner profile
      const profileRes = await fetch("/api/partner/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setPartnerProfile(profileData.data);
        setProfileForm({
          name: profileData.data.name || "",
          phone: profileData.data.phone || "",
          location: profileData.data.location || "",
          companyName: profileData.data.companyName || "",
          profileImage: profileData.data.profileImage || ""
        });
      }

      const notifRes = await fetch("/api/partner/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.data.notifications);
        setNotifUnreadCount(notifData.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const { logout: authLogout } = useAuthGuard(user !== null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(userData);
      if (parsed.role !== "event_partner") {
        router.replace("/login");
        return;
      }
      setUser(parsed);
      fetchData().finally(() => setLoading(false));
    };
    checkAuth();
  }, [router, fetchData]);

  const handleLogout = () => {
    authLogout();
  };

  const createBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token || !bookingForm.artistId) return;

    if (!bookingForm.eventName.trim()) {
      setBookingError("Please enter an event name");
      return;
    }

    const pairs = bookingForm.dates.slice(0, 2).map((d, i) => ({ date: d.trim(), venue: (bookingForm.venues[i] || "").trim() }));
    const validPairs = pairs.filter(p => p.date && p.venue);
    const orphanDates = pairs.filter(p => p.date && !p.venue);
    const orphanVenues = pairs.filter(p => !p.date && p.venue);

    if (validPairs.length === 0) {
      setBookingError("Please provide at least one date with a matching venue");
      return;
    }
    if (orphanDates.length > 0) {
      setBookingError("Every date must have a venue name beside it");
      return;
    }
    if (orphanVenues.length > 0) {
      setBookingError("Every venue must have a date selected beside it");
      return;
    }

    const filteredDates = validPairs.map(p => p.date);
    const filteredVenues = validPairs.map(p => p.venue);

    setBookingLoading(true);
    setBookingSuccess("");
    setBookingError("");

    try {
      const res = await fetch("/api/partner/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          artistId: bookingForm.artistId,
          eventName: bookingForm.eventName.trim(),
          eventType: bookingForm.eventType,
          proposedDates: filteredDates,
          proposedVenues: filteredVenues,
          notes: bookingForm.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess("Booking request sent successfully!");
        setBookingForm({ artistId: "", eventName: "", eventType: "Private Event", dates: ["", "", "", "", ""], venues: ["", "", "", "", ""], notes: "" });
        setSelectedArtist(null);
        fetchData();
        setTimeout(() => setBookingSuccess(""), 3000);
      } else {
        setBookingError(data.error || "Failed to create booking");
        if (data.error?.includes("phone")) alert(data.error);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setBookingError("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const updateBooking = async (bookingId: string, action: "cancel" | "markPaid" | "complete") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/partner/bookings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingProof(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ file: reader.result, folder: "payment-proofs" })
        });
        const data = await res.json();
        if (data.success) {
          setPaymentProofForm({ ...paymentProofForm, screenshot: data.url });
        } else {
          alert(data.error || "Failed to upload image. It might be too large.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. The image might be too large (must be under 1MB).");
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const submitPaymentProof = async () => {
    const token = localStorage.getItem("token");
    if (!token || !showPaymentProofModal) return;

    if (!paymentProofForm.screenshot || !paymentProofForm.utr || !paymentProofForm.paidAt) {
      alert("Please provide screenshot, UTR number, and payment date/time");
      return;
    }

    setPayingBooking(showPaymentProofModal);
    try {
      const advanceAmt = paymentProofForm.paymentType === "advance" ? Math.round(
        (bookings.find(b => b._id === showPaymentProofModal)?.finalPrice || 0) * 0.3
      ) : 0;
      const res = await fetch("/api/partner/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingId: showPaymentProofModal,
          action: "submitPaymentProof",
          screenshot: paymentProofForm.screenshot,
          utr: paymentProofForm.utr,
          paidAt: paymentProofForm.paidAt,
          paymentType: paymentProofForm.paymentType,
          advanceAmount: advanceAmt
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess("Payment proof submitted! Awaiting admin verification.");
        setShowPaymentProofModal(null);
        setPaymentProofForm({ screenshot: "", utr: "", paidAt: "", paymentType: "full" });
        setSelectedPaymentType(null);
        fetchData();
        setTimeout(() => setPaymentSuccess(""), 3000);
      } else {
        alert(data.error || "Failed to submit payment proof");
      }
    } catch (error) {
      console.error("Submit payment proof error:", error);
      alert("Failed to submit payment proof");
    } finally {
      setPayingBooking(null);
    }
  };

  const submitReview = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, rating: reviewForm.rating, comment: reviewForm.comment })
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewModal(null);
        setReviewForm({ rating: 5, comment: "" });
        setPaymentSuccess("Review submitted!");
        setTimeout(() => setPaymentSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ file: reader.result, folder: "profile" })
        });
        const data = await res.json();
        if (data.success) {
          setProfileForm({ ...profileForm, profileImage: data.url });
        } else {
          alert(data.error || "Failed to upload image. It might be too large.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. The image might be too large (must be under 1MB).");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const savePartnerProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingProfile(true);
    setProfileMsg("");

    try {
      const res = await fetch("/api/partner/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setPartnerProfile(data.data);
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredArtists = artists.filter((a: any) => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingBookings = bookings.filter(b => b.status === "pending" || b.status === "awaiting_confirmation");
  const acceptedBookings = bookings.filter(b => b.status === "accepted" || b.status === "confirmed" || b.status === "awaiting_confirmation");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled" || b.status === "rejected");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-brand-surface border-r border-white/[0.06] p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-end gap-[3px] h-6">
              {[0, 150, 80, 200].map((delay, i) => (
                <div key={i} className="w-[3px] rounded-full bg-gradient-to-t from-brand-orange to-brand-pink animate-equalizer" style={{ animationDelay: `${delay}ms`, height: `${12 + i * 4}px` }} />
              ))}
            </div>
            <span className="text-lg font-display font-bold"><span className="gradient-text">Vibe</span><span className="text-white">Stage</span></span>
          </Link>
        </div>

        <nav className="space-y-1">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "browse", icon: Music, label: "Browse Artists" },
            { id: "bookings", icon: Calendar, label: "My Bookings" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "profile", icon: Settings, label: "Profile" },
            { id: "history", icon: ChevronRight, label: "History" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-brand-gradient text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === "bookings" && pendingBookings.length > 0 && (
                <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
              )}
              {item.id === "notifications" && notifUnreadCount > 0 && (
                <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{notifUnreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all mt-4">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
        <button
          onClick={async () => {
            if (!confirm("Are you sure you want to request account deletion? This cannot be undone.")) return;
            const token = localStorage.getItem("token");
            const res = await fetch("/api/user/delete-request", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) alert("Deletion request sent to admin.");
            else alert(data.error || "Failed to send request");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2"
        >
          <X className="w-5 h-5" />
          <span className="font-medium">Request Account Deletion</span>
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-surface border-t border-white/[0.06] flex justify-around py-2 px-1">
        {[
          { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { id: "browse", icon: Music, label: "Browse" },
          { id: "bookings", icon: Calendar, label: "Bookings" },
          { id: "notifications", icon: Bell, label: "Alerts" },
          { id: "profile", icon: Settings, label: "Profile" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === item.id ? "text-brand-orange" : "text-white/40 hover:text-white/60"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.id === "bookings" && pendingBookings.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-pink" />
            )}
            {item.id === "notifications" && notifUnreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-pink" />
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-surface border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold gradient-text">Partner Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="text-white/60 p-1"><LogOut className="w-5 h-5" /></button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/60 p-1">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-brand-bg/95 backdrop-blur-sm pt-16">
          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "browse", icon: Music, label: "Browse Artists" },
              { id: "bookings", icon: Calendar, label: "My Bookings" },
              { id: "notifications", icon: Bell, label: "Notifications" },
              { id: "profile", icon: Settings, label: "Profile" },
              { id: "history", icon: ChevronRight, label: "History" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? "bg-brand-gradient text-white" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.id === "bookings" && pendingBookings.length > 0 && (
                  <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                )}
                {item.id === "notifications" && notifUnreadCount > 0 && (
                  <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{notifUnreadCount}</span>
                )}
              </button>
            ))}
            <div className="border-t border-white/[0.06] pt-2 mt-2">
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to request account deletion? This cannot be undone.")) return;
                  const token = localStorage.getItem("token");
                  const res = await fetch("/api/user/delete-request", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const data = await res.json();
                  if (data.success) alert("Deletion request sent to admin.");
                  else alert(data.error || "Failed to send request");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Request Account Deletion</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pt-16 lg:pt-8 pb-20 lg:pb-6">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Welcome back, {user?.name}!</h2>
                <p className="text-white/40 mt-1">Event Partner Dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5" onClick={() => setActiveTab("bookings")}>
                <p className="text-white/40 text-sm mb-1">Total Bookings</p>
                <p className="text-2xl font-bold gradient-text">{stats.totalBookings}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Upcoming</p>
                <p className="text-2xl font-bold gradient-text">{stats.upcomingEvents}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Completed</p>
                <p className="text-2xl font-bold gradient-text">{completedBookings.length}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold gradient-text">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab("browse")} className="w-full text-left p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
                    <p className="text-white font-medium">Browse Artists</p>
                    <p className="text-sm text-white/40">Find performers for your events</p>
                  </button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking._id} className="p-3 rounded-lg bg-white/[0.04]">
                        <p className="text-white font-medium">{booking.eventName}</p>
                        <p className="text-sm text-white/40">{booking.artistName || "Artist"} • {booking.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40">No bookings yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browse Artists Tab */}
        {activeTab === "browse" && (
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Browse Artists</h2>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search by name, genre, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30"
              />
            </div>

            {filteredArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredArtists.map((artist: any) => (
                  <div key={artist._id} className="glass-card p-4">
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                      <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-brand-bg/80 text-white">{artist.genre}</div>
                    </div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      {artist.name}
                      {artist.isVerified ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-semibold">Verified</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 font-semibold">Unverified</span>
                      )}
                    </h3>
                    <p className="text-sm text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> {artist.location}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold gradient-text">₹{calculateFinalPrice(artist.price).toLocaleString()}</span>
                        <span className="text-xs text-white/30">/show</span>
                      </div>
                      <button 
                        onClick={() => { setSelectedArtist(artist); setBookingForm({ ...bookingForm, artistId: artist._id }); }}
                        className="px-4 py-1.5 rounded-lg text-sm bg-brand-gradient text-white"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No artists found</p>
              </div>
            )}

            {selectedArtist && (
              <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-brand-bg/90 overflow-y-auto pt-4 sm:pt-8">
                <div className="glass-card p-4 sm:p-6 max-w-lg w-full my-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Image src={selectedArtist.image} alt={selectedArtist.name} width={48} height={48} className="rounded-xl object-cover w-12 h-12" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">{selectedArtist.name}</h3>
                      <p className="text-xs sm:text-sm text-white/40 truncate">{selectedArtist.genre} • {selectedArtist.location}</p>
                    </div>
                    <button onClick={() => setSelectedArtist(null)} className="shrink-0 text-white/40"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Event Name *</label>
                        <input type="text" value={bookingForm.eventName} onChange={(e) => setBookingForm({ ...bookingForm, eventName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm" placeholder="My Wedding" required />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Event Type</label>
                        <select value={bookingForm.eventType} onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm">
                          <option value="Private Event">Private Event</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Festival">Festival</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Proposed Dates and Venues *</label>
                      <div className="space-y-2">
                        {[0, 1].map((i) => (
                          <div key={i} className="flex gap-2">
                            <input type="date" value={bookingForm.dates[i]} min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                              onChange={(e) => { const nd = [...bookingForm.dates]; nd[i] = e.target.value; setBookingForm({ ...bookingForm, dates: nd }); }}
                              className="w-1/2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm" />
                            <input type="text" value={bookingForm.venues[i]} placeholder={i === 0 ? "Venue name" : "Venue name"}
                              onChange={(e) => { const nv = [...bookingForm.venues]; nv[i] = e.target.value; setBookingForm({ ...bookingForm, venues: nv }); }}
                              className="w-1/2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">Each date needs a venue beside it. Pairs help the artist decide.</p>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Notes</label>
                      <textarea value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm resize-none" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-orange/10">
                      <span className="text-white/40 text-sm">Final Price:</span>
                      <span className="text-lg font-bold gradient-text">₹{calculateFinalPrice(selectedArtist.price).toLocaleString()}</span>
                    </div>
                    {bookingSuccess && (
                      <div className="p-3 rounded-xl bg-green-500/10 text-green-400 text-sm text-center">{bookingSuccess}</div>
                    )}
                    {bookingError && (
                      <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm text-center font-medium">{bookingError}</div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedArtist(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/60 hover:text-white text-sm">
                        Cancel
                      </button>
                      <button onClick={createBooking} disabled={bookingLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-medium">
                        <span>{bookingLoading ? "Sending..." : "Send Booking Request"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        {/* My Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">My Bookings</h2>
            
            <div className="flex gap-2 mb-6">
              {[
                { label: "All", list: bookings },
                { label: "Pending", list: pendingBookings },
                { label: "Accepted", list: acceptedBookings },
                { label: "Completed", list: completedBookings },
                { label: "Cancelled", list: cancelledBookings },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => {}}
                  className="px-4 py-1.5 rounded-full text-sm bg-white/[0.04] text-white/60 hover:text-white"
                >
                  {tab.label} ({tab.list.length})
                </button>
              ))}
            </div>

            {paymentSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400">{paymentSuccess}</div>
            )}
            
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const artist = artists.find(a => a._id === (booking.artistId?._id || booking.artistId));
                  return (
                    <div key={booking._id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-brand-orange" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{booking.eventName}</p>
                            <p className="text-sm text-white/40">
                              {booking.artistName || artist?.name}
                              {booking.status === "accepted" && booking.acceptedDate && ` • ${new Date(booking.acceptedDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === "completed" ? "bg-green-500/20 text-green-400" :
                            booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                            booking.status === "accepted" ? "bg-blue-500/20 text-blue-400" :
                            booking.status === "awaiting_confirmation" ? "bg-purple-500/20 text-purple-400" :
                            booking.status === "cancelled" || booking.status === "rejected" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>{booking.status === "awaiting_confirmation" ? "Verifying Payment" : booking.status}</span>
                          <p className="text-brand-orange font-semibold">₹{booking.finalPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Show proposed date-venue pairs for pending */}
                      {booking.status === "pending" && (
                        <div className="mb-3 text-sm space-y-1">
                          <p className="text-white/40 font-medium">Proposed Options:</p>
                          {(booking.proposedDates || []).map((d: string, i: number) => {
                            const venue = (booking.proposedVenues || [])[i];
                            if (!venue) return null;
                            return (
                              <p key={i} className="text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                                {new Date(d).toLocaleDateString()} <span className="text-white/20">→</span> {venue}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Show accepted date/venue */}
                      {booking.status === "accepted" && booking.acceptedDate && (
                        <div className="mb-3 text-sm">
                          <p className="text-green-400">Artist available on: {new Date(booking.acceptedDate).toLocaleDateString()} at {booking.acceptedVenue}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {/* Pending - no actions for organizer yet */}
                        
                        {/* Accepted - show UPI details & payment upload */}
                        {booking.status === "accepted" && (
                          <>
                            <div className="w-full mb-3 p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/30">
                              <p className="text-sm text-brand-orange font-semibold mb-2">Pay via UPI</p>
                              <div className="flex gap-4 items-start">
                                {platformSettings?.platformUpiQrCode && (
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/[0.08] flex-shrink-0">
                                    <Image src={platformSettings.platformUpiQrCode} alt="UPI QR" width={96} height={96} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-white/60 text-xs">UPI ID:</p>
                                  <p className="text-white font-mono font-medium">{platformSettings?.platformUpiId || "Not set by admin"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="w-full flex flex-wrap gap-2 mb-1">
                              <button
                                onClick={() => {
                                  setShowPaymentProofModal(booking._id);
                                  setSelectedPaymentType("full");
                                  setPaymentProofForm({ screenshot: "", utr: "", paidAt: "", paymentType: "full" });
                                }}
                                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-brand-gradient text-white text-sm font-medium"
                              >
                                Pay Full &nbsp; <span className="text-white/80">₹{booking.finalPrice.toLocaleString()}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowPaymentProofModal(booking._id);
                                  setSelectedPaymentType("advance");
                                  setPaymentProofForm({ screenshot: "", utr: "", paidAt: "", paymentType: "advance" });
                                }}
                                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-brand-orange/20 text-brand-orange text-sm font-medium border border-brand-orange/30"
                              >
                                Pay 30% Advance &nbsp; <span className="text-white/80">₹{Math.round(booking.finalPrice * 0.3).toLocaleString()}</span>
                              </button>
                            </div>
                            <button
                              onClick={() => updateBooking(booking._id, "cancel")}
                              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {/* Awaiting admin verification */}
                        {booking.status === "awaiting_confirmation" && (
                          <>
                            <div className="w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
                              <p className="text-yellow-400 font-medium">Payment Under Verification</p>
                              <p className="text-white/60 text-xs mt-1">Your payment proof has been submitted. Admin will verify and confirm shortly.</p>
                              {booking.paymentProof?.screenshot && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-white/60 text-xs">Type: <span className="text-white font-medium">{booking.paymentType === "advance" ? "30% Advance" : "Full Payment"}</span></p>
                                  <p className="text-white/40 text-xs">UTR: {booking.paymentProof.utr}</p>
                                  <p className="text-white/40 text-xs">Paid on: {new Date(booking.paymentProof.paidAt).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Confirmed */}
                        {booking.status === "confirmed" && (
                          <>
                            <div className="w-full p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm">
                              <p className="text-green-400 font-medium">Booking Confirmed ✓</p>
                              {booking.paymentType === "full" && !booking.adminPaidArtist && (
                                <p className="text-white/60 text-xs mt-1">Full payment verified. Awaiting admin to release payment to artist.</p>
                              )}
                              {booking.paymentType === "full" && booking.adminPaidArtist && (
                                <p className="text-green-400/80 text-xs mt-1">Payment done. Check your bank.</p>
                              )}
                              {booking.paymentType === "advance" && (
                                <p className="text-white/60 text-xs mt-1">30% advance received. Pay remaining ₹{(booking.finalPrice - (booking.advanceAmount || Math.round(booking.finalPrice * 0.3))).toLocaleString()} to artist before the show.</p>
                              )}
                            </div>
                            {booking.paymentType === "full" && booking.adminPaidArtist && (
                              <p className="w-full text-green-400/60 text-xs">Payment done. Check your bank.</p>
                            )}
                            <button
                              onClick={() => updateBooking(booking._id, "complete")}
                              className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm"
                            >
                              Mark Completed
                            </button>
                          </>
                        )}

                        {booking.status === "completed" && (
                          <button
                            onClick={() => setShowReviewModal(booking._id)}
                            className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
                          >
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No bookings yet</p>
                <button onClick={() => setActiveTab("browse")} className="btn-primary mt-4">Browse Artists</button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white">Notifications</h2>
              {notifUnreadCount > 0 && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    await fetch("/api/partner/notifications", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ markAllRead: true })
                    });
                    fetchData();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] text-white/60 hover:text-white text-sm"
                >
                  Mark All Read
                </button>
              )}
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    onClick={async () => {
                      if (notif.isRead) return;
                      const token = localStorage.getItem("token");
                      await fetch("/api/partner/notifications", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ notificationId: notif._id })
                      });
                      fetchData();
                    }}
                    className={`glass-card p-4 cursor-pointer ${!notif.isRead ? "border-l-4 border-l-brand-orange" : ""}`}
                  >
                    <p className="text-white font-medium">{notif.title}</p>
                    <p className="text-sm text-white/40">{notif.message}</p>
                    <p className="text-xs text-white/30 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No notifications</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Profile Settings</h2>
            
            {profileMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400">{profileMsg}</div>
            )}

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-orange group">
                    {profileForm.profileImage ? (
                      <Image src={profileForm.profileImage} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                        <User className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={profileFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => profileFileRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-medium"
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Location</label>
                    <input 
                      type="text" 
                      value={profileForm.location} 
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Company Name</label>
                    <input 
                      type="text" 
                      value={profileForm.companyName} 
                      onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" 
                    />
                  </div>
                </div>
              </div>

              <button onClick={savePartnerProfile} disabled={savingProfile} className="btn-primary w-full">
                <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Booking History</h2>
            {completedBookings.length > 0 || cancelledBookings.length > 0 ? (
              <div className="space-y-3">
                {[...completedBookings, ...cancelledBookings].map((booking) => (
                  <div key={booking._id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{booking.eventName}</p>
                      <p className="text-sm text-white/40">
                        {booking.artistName}
                        {booking.acceptedDate ? ` • ${new Date(booking.acceptedDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-orange font-semibold">₹{booking.finalPrice.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No booking history yet</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewForm({ ...reviewForm, rating })}
                      className={`p-2 rounded-lg ${reviewForm.rating >= rating ? "text-yellow-400" : "text-white/30"}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-2">Comment (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(null)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitReview(showReviewModal)}
                  className="flex-1 px-4 py-2 rounded-xl bg-brand-gradient text-white font-medium"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {showPaymentProofModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Upload Payment Proof</h3>
              <button onClick={() => setShowPaymentProofModal(null)} className="text-white/40"><X className="w-5 h-5" /></button>
            </div>
            {selectedPaymentType && (
              <div className="mb-4 p-3 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-sm">
                <p className="text-brand-orange font-medium">{selectedPaymentType === "advance" ? "30% Advance Payment" : "Full Payment"}</p>
                <p className="text-white/60 text-xs mt-1">
                  Amount: ₹{(selectedPaymentType === "advance"
                    ? Math.round((bookings.find(b => b._id === showPaymentProofModal)?.finalPrice || 0) * 0.3)
                    : (bookings.find(b => b._id === showPaymentProofModal)?.finalPrice || 0)
                  ).toLocaleString()}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-2">Payment Screenshot</label>
                {paymentProofForm.screenshot ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/[0.08] mb-2">
                    <Image src={paymentProofForm.screenshot} alt="Payment Screenshot" fill className="object-contain" />
                    <button
                      onClick={() => setPaymentProofForm({ ...paymentProofForm, screenshot: "" })}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => proofFileRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-40 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-brand-orange/50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">{uploadingProof ? "Uploading..." : "Click to upload screenshot"}</span>
                  </div>
                )}
                <input
                  ref={proofFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentProofUpload}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">UTR Number *</label>
                <input
                  type="text"
                  value={paymentProofForm.utr}
                  onChange={(e) => setPaymentProofForm({ ...paymentProofForm, utr: e.target.value })}
                  placeholder="e.g. HDFC123456789"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Payment Date & Time *</label>
                <input
                  type="datetime-local"
                  value={paymentProofForm.paidAt}
                  onChange={(e) => setPaymentProofForm({ ...paymentProofForm, paidAt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowPaymentProofModal(null); setPaymentProofForm({ screenshot: "", utr: "", paidAt: "", paymentType: "full" }); setSelectedPaymentType(null); }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPaymentProof}
                  disabled={payingBooking === showPaymentProofModal}
                  className="flex-1 px-4 py-2 rounded-xl bg-brand-gradient text-white font-medium disabled:opacity-50"
                >
                  {payingBooking === showPaymentProofModal ? "Submitting..." : "Submit Proof"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}