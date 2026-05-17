"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, User, Calendar, Bell, DollarSign, 
  Music, ChevronRight, LogOut, Check, X, Eye, Upload, Star
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Artist {
  _id: string;
  name: string;
  stageName: string;
  realName: string;
  genre: string[];
  price: number;
  image: string;
  coverImage: string;
  gallery: string[];
  videoUrl: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  responseTime: string;
  location: string;
  city: string;
  bio: string;
  phone: string;
  languages: string[];
  performanceLanguages: string[];
  socialLinks: { instagram?: string; youtube?: string; website?: string };
  upiId: string;
  upiQrCode: string;
  isAvailable: boolean;
  isVerified: boolean;
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
  artistPayout: number;
  status: string;
  paymentStatus: string;
  paymentType: string;
  organizerPaidAdmin: boolean;
  adminPaidArtist: boolean;
  organizerName: string;
  organizerEmail: string;
  advanceAmount: number;
  organizerId?: { _id: string; name: string; email: string; phone: string };
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalBookings: number;
  totalEarnings: number;
  pendingPayouts: number;
}

const ADMIN_COMMISSION_PERCENT = 30;

export default function ArtistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalBookings: 0, totalEarnings: 0, pendingPayouts: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "", stageName: "", realName: "", phone: "", location: "", city: "", genre: "", genres: "", bio: "",
    languages: "", performanceLanguages: "", instagram: "", youtube: "", website: "", price: 0, image: "",
    coverImage: "", videoUrl: "", upiId: "", upiQrCode: ""
  });
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const upiQrInputRef = useRef<HTMLInputElement>(null);

  const fetchArtistData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const profileRes = await fetch("/api/artist/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setArtist(profileData.data);
        setGallery(profileData.data.gallery || []);
        setProfileForm({
          name: profileData.data.name || "",
          stageName: profileData.data.stageName || "",
          realName: profileData.data.realName || "",
          phone: profileData.data.phone || "",
          location: profileData.data.location || "",
          city: profileData.data.city || "",
          genre: profileData.data.genre?.join(", ") || "",
          genres: profileData.data.genre?.join(", ") || "",
          bio: profileData.data.bio || "",
          languages: profileData.data.languages?.join(", ") || "",
          performanceLanguages: profileData.data.performanceLanguages?.join(", ") || "",
          instagram: profileData.data.socialLinks?.instagram || "",
          youtube: profileData.data.socialLinks?.youtube || "",
          website: profileData.data.socialLinks?.website || "",
          price: profileData.data.price || 0,
          image: profileData.data.image || "",
          coverImage: profileData.data.coverImage || "",
          videoUrl: profileData.data.videoUrl || "",
          upiId: profileData.data.upiId || "",
          upiQrCode: profileData.data.upiQrCode || ""
        });
      }

      const bookingsRes = await fetch("/api/artist/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data.bookings);
        setStats(bookingsData.data.stats);
      }

      const notifRes = await fetch("/api/artist/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.data.notifications);
        setUnreadCount(notifData.data.unreadCount);
      }

      const sessionsRes = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success) {
        setSessions(sessionsData.data.sessions);
      }
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(type);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ file: reader.result, folder: type, type })
        });
        const data = await res.json();
        if (data.success) {
          if (type === "profile") {
            setProfileForm({ ...profileForm, image: data.url });
          } else if (type === "cover") {
            setProfileForm({ ...profileForm, coverImage: data.url });
          } else if (type === "gallery") {
            setGallery([...gallery, data.url]);
          } else if (type === "upiQr") {
            setProfileForm({ ...profileForm, upiQrCode: data.url });
          }
        }
        if (!data.success) {
          alert(data.error || "Failed to upload image. It might be too large.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. The image might be too large (must be under 1MB).");
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(userData);
      if (parsed.role !== "artist") {
        router.push("/login");
        return;
      }
      setUser(parsed);
      fetchArtistData().finally(() => setLoading(false));
    };
    checkAuth();
  }, [router, fetchArtistData]);

  const calculateFinalPrice = (basePrice: number) => Math.round(basePrice * (1 + ADMIN_COMMISSION_PERCENT / 100));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/artist/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileForm,
          genre: profileForm.genre.split(",").map(s => s.trim()).filter(Boolean),
          languages: profileForm.languages.split(",").map(s => s.trim()).filter(Boolean),
          performanceLanguages: profileForm.performanceLanguages.split(",").map(s => s.trim()).filter(Boolean),
          socialLinks: {
            instagram: profileForm.instagram,
            youtube: profileForm.youtube,
            website: profileForm.website
          },
          upiId: profileForm.upiId,
          upiQrCode: profileForm.upiQrCode,
          gallery
        })
      });
      const data = await res.json();
      if (data.success) {
        setArtist(data.data);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: "accept" | "reject") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/artist/bookings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchArtistData();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("/api/artist/notifications", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });
      fetchArtistData();
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const [selectedAcceptData, setSelectedAcceptData] = useState<{ [bookingId: string]: { date: string; venue: string } }>({});

  const upcomingBookings = bookings.filter(b => b.status === "confirmed" || b.status === "accepted");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed" || b.status === "paid" || b.status === "confirmed");

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
            { id: "profile", icon: User, label: "Edit Profile" },
            { id: "availability", icon: Calendar, label: "Availability" },
            { id: "requests", icon: Music, label: "Booking Requests" },
            { id: "history", icon: ChevronRight, label: "Booking History" },
            { id: "earnings", icon: DollarSign, label: "Earnings" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "sessions", icon: Eye, label: "Sessions" },
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
              {item.id === "requests" && pendingBookings.length > 0 && (
                <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
              )}
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
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

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 pt-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-display font-bold gradient-text">Artist Dashboard</h1>
          <button onClick={handleLogout} className="text-white/60"><LogOut className="w-5 h-5" /></button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Welcome back, {artist?.name || user?.name}!</h2>
                <p className="text-white/40 mt-1">{artist?.stageName || artist?.genre || "Artist"} • {artist?.location}</p>
              </div>
              <div className="hidden md:block w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange">
                <Image src={artist?.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"} alt={artist?.name || "Artist"} width={64} height={64} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Total Bookings</p>
                <p className="text-2xl font-bold gradient-text">{stats.totalBookings}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Upcoming Events</p>
                <p className="text-2xl font-bold gradient-text">{upcomingBookings.length}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Total Earnings</p>
                <p className="text-2xl font-bold gradient-text">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/40 text-sm mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-brand-orange">₹{stats.pendingPayouts.toLocaleString()}</p>
              </div>
            </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Bookings</h3>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 3).map((booking) => {
                      const orgPhone = (booking.organizerId as any)?.phone || "";
                      return (
                      <div key={booking._id} className="p-4 rounded-xl bg-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{booking.eventName}</p>
                            <p className="text-sm text-white/40">
                              {booking.organizerName}
                              {booking.acceptedDate
                                ? ` • ${new Date(booking.acceptedDate).toLocaleDateString()}`
                                : (booking.proposedDates || []).length > 0
                                  ? ` • ${(booking.proposedDates || []).length} proposed dates`
                                  : booking.date ? ` • ${new Date(booking.date).toLocaleDateString()}` : ""
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-brand-orange font-semibold">₹{booking.finalPrice.toLocaleString()}</p>
                            <p className="text-xs text-white/40">Your cut: ₹{booking.artistPayout.toLocaleString()}</p>
                          </div>
                        </div>
                        {(booking.status === "accepted" || booking.status === "confirmed") && (
                          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1 text-sm">
                            {booking.status === "confirmed" && booking.paymentType === "advance" && (
                              <p className="text-brand-orange font-medium">Advance received. Ask rest ₹{booking.artistPayout.toLocaleString()} from organizer before show.</p>
                            )}
                            <p className="text-white/50">Contact: <span className="text-white">{booking.organizerName}</span> • <span className="text-white">{booking.organizerEmail}</span>{orgPhone ? <span> • <span className="text-white">{orgPhone}</span></span> : ""}</p>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
              ) : (
                <p className="text-white/40">No pending bookings</p>
              )}
            </div>

            <div className="glass-card p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rules to Get Verified Batch</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange font-bold mt-0.5">1.</span>
                  <span>Must have <strong className="text-white">1500 followers or above</strong> on Instagram (public profile)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange font-bold mt-0.5">2.</span>
                  <span>Must have <strong className="text-white">20 or above reels</strong> of singing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange font-bold mt-0.5">3.</span>
                  <span>Must have some proofs of performance on Instagram or YouTube channel</span>
                </li>
              </ul>
              <p className="text-xs text-white/30 mt-4">Contact admin to get verified once you meet the criteria.</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Edit Profile</h2>
            
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400">{successMsg}</div>
            )}

            <div className="space-y-6">
              {/* Profile Image */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-orange group">
                    {profileForm.image ? (
                      <Image src={profileForm.image} alt="Profile" fill className="object-cover" />
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading !== null}
                    className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-medium"
                  >
                    {uploading === "profile" ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cover / Banner Image</h3>
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/[0.08] group">
                  {profileForm.coverImage ? (
                    <Image src={profileForm.coverImage} alt="Cover" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cover")}
                    className="hidden"
                  />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploading !== null}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium"
                  >
                    {uploading === "cover" ? "Uploading..." : "Upload Cover"}
                  </button>
                </div>
              </div>

              {/* Gallery */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Gallery Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {gallery.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                      <button
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-brand-orange/50 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>Add to Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "gallery")}
                    className="hidden"
                    disabled={uploading !== null}
                  />
                </label>
                {uploading === "gallery" && <p className="text-center text-sm text-brand-orange mt-2">Uploading...</p>}
              </div>

              {/* Basic Info */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Full Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Stage Name</label>
                    <input type="text" value={profileForm.stageName} onChange={(e) => setProfileForm({ ...profileForm, stageName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Phone Number</label>
                    <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">City / Location</label>
                    <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Genre / Category</label>
                    <input type="text" value={profileForm.genre} onChange={(e) => setProfileForm({ ...profileForm, genre: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Languages (comma separated)</label>
                    <input type="text" value={profileForm.languages} onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })} placeholder="Hindi, English" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Bio / About</h3>
                <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} placeholder="Tell clients about yourself..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white resize-none" />
              </div>

              {/* Social Links */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Instagram</label>
                    <input type="text" value={profileForm.instagram} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} placeholder="https://instagram.com/..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">YouTube</label>
                    <input type="text" value={profileForm.youtube} onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })} placeholder="https://youtube.com/..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Website</label>
                    <input type="text" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
                <div className="flex items-center gap-8">
                  <div className="flex-1">
                    <label className="block text-sm text-white/40 mb-1.5">Your Base Price (₹)</label>
                    <input type="number" value={profileForm.price} onChange={(e) => setProfileForm({ ...profileForm, price: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-brand-orange mb-1.5">Final Customer Price (₹)</label>
                    <div className="px-4 py-3 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-white">
                      ₹{calculateFinalPrice(profileForm.price).toLocaleString()}
                      <span className="text-xs text-white/40 ml-2">(auto-calculated)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/30 mt-3">
                  System automatically adds {ADMIN_COMMISSION_PERCENT}% platform fee. Final price shown to customers = ₹{calculateFinalPrice(profileForm.price).toLocaleString()}
                </p>
              </div>

              {/* UPI Payment Details */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">UPI Payment Details</h3>
                <p className="text-sm text-white/40 mb-4">Your UPI details are only visible to the admin for payment processing.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">UPI ID</label>
                    <input type="text" value={profileForm.upiId} onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })} placeholder="yourname@upi" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">UPI QR Code</label>
                    {profileForm.upiQrCode ? (
                      <div className="relative">
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-white/[0.08] mb-2">
                          <Image src={profileForm.upiQrCode} alt="UPI QR Code" width={128} height={128} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => upiQrInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/60 hover:text-white text-xs"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => setProfileForm({ ...profileForm, upiQrCode: "" })}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => upiQrInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-brand-orange/50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs">{uploading === "upiQr" ? "Uploading..." : "Upload QR"}</span>
                      </div>
                    )}
                    <input
                      ref={upiQrInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "upiQr" as any)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} className="btn-primary w-full">
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Availability Management</h2>
            <div className="glass-card p-6">
              <p className="text-white/40 mb-4">Mark yourself as available or unavailable for bookings.</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!token || !artist) return;
                    await fetch("/api/artist/profile", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ isAvailable: !artist.isAvailable })
                    });
                    fetchArtistData();
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    artist?.isAvailable 
                      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {artist?.isAvailable ? "✓ Currently Available" : "✗ Currently Unavailable"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Requests Tab */}
        {activeTab === "requests" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Booking Requests</h2>
            {pendingBookings.length > 0 ? (
              <div className="space-y-4">
                {pendingBookings.map((booking) => {
                  const selData = selectedAcceptData[booking._id] || { date: "", venue: "" };
                  const setSelData = (date: string, venue: string) => {
                    setSelectedAcceptData(prev => ({ ...prev, [booking._id]: { date, venue } }));
                  };
                  return (
                    <div key={booking._id} className="glass-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{booking.eventName}</h3>
                          <p className="text-sm text-white/40">{booking.eventType}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div><span className="text-white/40">Your Payout:</span> <span className="text-green-400 font-semibold">₹{booking.artistPayout.toLocaleString()}</span></div>
                        <div><span className="text-white/40">Client:</span> <span className="text-white">{booking.organizerName}</span></div>
                      </div>
                      
                      {/* Proposed Dates */}
                      <div className="mb-4">
                        <p className="text-sm text-white/40 mb-2">Proposed Dates (select one):</p>
                        <div className="flex flex-wrap gap-2">
                          {(booking.proposedDates || []).map((d, i) => (
                            <button
                              key={i}
                              onClick={() => setSelData(d, selData.venue)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selData.date === d ? "bg-brand-orange/20 border-brand-orange text-white" : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white"}`}
                            >
                              {new Date(d).toLocaleDateString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Proposed Venues */}
                      <div className="mb-4">
                        <p className="text-sm text-white/40 mb-2">Proposed Venues (select one):</p>
                        <div className="flex flex-wrap gap-2">
                          {(booking.proposedVenues || []).map((v, i) => (
                            <button
                              key={i}
                              onClick={() => setSelData(selData.date, v)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selData.venue === v ? "bg-brand-orange/20 border-brand-orange text-white" : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white"}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            if (!selData.date || !selData.venue) return;
                            const token = localStorage.getItem("token");
                            const res = await fetch("/api/artist/bookings", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ bookingId: booking._id, action: "accept", acceptedDate: selData.date, acceptedVenue: selData.venue })
                            });
                            const data = await res.json();
                            if (data.success) fetchArtistData();
                          }}
                          disabled={!selData.date || !selData.venue}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-40"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => handleBookingAction(booking._id, "reject")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                      {(!selData.date || !selData.venue) && (
                        <p className="text-xs text-white/30 mt-2 text-center">Select a date and venue to enable Accept</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No pending booking requests</p>
              </div>
            )}
          </div>
        )}

        {/* Booking History Tab */}
        {activeTab === "history" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Booking History</h2>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const orgPhone = (booking.organizerId as any)?.phone || "";
                  return (
                    <div key={booking._id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{booking.eventName}</p>
                          <p className="text-sm text-white/40">
                            {booking.organizerName}
                            {booking.acceptedDate
                              ? ` • ${new Date(booking.acceptedDate).toLocaleDateString()}`
                              : booking.date
                                ? ` • ${new Date(booking.date).toLocaleDateString()}`
                                : ""
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-brand-orange font-semibold">₹{booking.finalPrice.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.status === "completed" || booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                            booking.status === "accepted" ? "bg-blue-500/20 text-blue-400" :
                            booking.status === "awaiting_confirmation" ? "bg-purple-500/20 text-purple-400" :
                            booking.status === "rejected" || booking.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>{booking.status === "awaiting_confirmation" ? "Verifying Payment" : booking.status}</span>
                        </div>
                      </div>
                      {(booking.status === "accepted" || booking.status === "confirmed" || booking.status === "awaiting_confirmation") && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                          {booking.status === "confirmed" && booking.paymentType === "advance" && (
                            <p className="text-sm text-brand-orange font-medium">
                              Advance received. Ask rest ₹{booking.artistPayout.toLocaleString()} from organizer before show.
                            </p>
                          )}
                          <div className="text-sm text-white/50">
                            <p>Organizer: <span className="text-white">{booking.organizerName}</span></p>
                            <p>Email: <span className="text-white">{booking.organizerEmail}</span></p>
                            {orgPhone && <p>Phone: <span className="text-white">{orgPhone}</span></p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No booking history yet</p>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-6">
                <p className="text-white/40 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold gradient-text">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6">
                <p className="text-white/40 text-sm mb-1">Pending Payouts</p>
                <p className="text-3xl font-bold text-brand-orange">₹{stats.pendingPayouts.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6">
                <p className="text-white/40 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
              {completedBookings.length > 0 ? (
                <div className="space-y-3">
                  {completedBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04]">
                      <div>
                        <p className="text-white text-sm">{booking.eventName}</p>
                        <p className="text-white/40 text-xs">{new Date(booking.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-green-400 font-semibold">+₹{booking.artistPayout.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40">No completed payouts yet</p>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    await fetch("/api/artist/notifications", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ markAllRead: true })
                    });
                    fetchArtistData();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] text-white/60 hover:text-white text-sm"
                >
                  Mark All Read
                </button>
              )}
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif._id} onClick={() => markNotificationRead(notif._id)} className={`glass-card p-4 cursor-pointer ${!notif.isRead ? "border-l-4 border-l-brand-orange" : ""}`}>
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

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Active Sessions</h2>
            <p className="text-white/40 text-sm mb-6">
              Showing your active login sessions. You can have up to 3 concurrent sessions.
            </p>

            {sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">#</th>
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Device</th>
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">IP Address</th>
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Logged In</th>
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Last Active</th>
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session: any, idx: number) => (
                      <tr key={session._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-4 px-4 text-white/50 text-sm">{idx + 1}</td>
                        <td className="py-4 px-4 text-white/70 text-sm max-w-[300px] truncate" title={session.deviceInfo}>
                          {session.deviceInfo}
                        </td>
                        <td className="py-4 px-4 text-white/70 text-sm">{session.ipAddress}</td>
                        <td className="py-4 px-4 text-white/50 text-sm">{new Date(session.createdAt).toLocaleString()}</td>
                        <td className="py-4 px-4 text-white/50 text-sm">{new Date(session.lastActive).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              if (!confirm("Terminate this session? You will be logged out on that device.")) return;
                              const res = await fetch(`/api/sessions?sessionId=${session._id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              const data = await res.json();
                              if (data.success) {
                                const token2 = localStorage.getItem("token");
                                const res2 = await fetch("/api/sessions", {
                                  headers: { Authorization: `Bearer ${token2}` }
                                });
                                const data2 = await res2.json();
                                if (data2.success) setSessions(data2.data.sessions);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-white/40">No active sessions</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}