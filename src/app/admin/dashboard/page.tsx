"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Users, Mic2, Calendar, DollarSign, LogOut, Eye, Trash2, ChevronLeft, CreditCard, CheckCircle, XCircle, Bell, Check, X, AlertTriangle, Upload } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Artist {
  _id: string;
  name: string;
  email: string;
  phone: string;
  genre: string;
  location: string;
  price: number;
  image: string;
  bio: string;
  rating?: number;
  languages?: string[];
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  upiId?: string;
  upiQrCode?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  eventName: string;
  artistId: { _id: string; name: string; genre: string; image: string };
  organizerEmail: string;
  organizerId: { _id: string; name: string; email: string };
  date: string;
  venue: string;
  acceptedDate: string;
  acceptedVenue: string;
  budget: number;
  finalPrice: number;
  basePrice: number;
  status: string;
  paymentStatus: string;
  paymentType: string;
  organizerPaidAdmin: boolean;
  adminPaidArtist: boolean;
  advanceAmount: number;
  artistUserId: string;
  artistPayout: number;
  createdAt: string;
  paymentProof: {
    screenshot: string;
    utr: string;
    paidAt: string;
  };
}

interface ProfileData {
  type: "artist" | "partner";
  data: Artist | Partner;
}

interface Analytics {
  totalArtists: number;
  totalPartners: number;
  totalBookings: number;
  totalRevenue: number;
  commission: number;
}

interface AdminNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  bookingId?: string;
}

type Tab = "analytics" | "artists" | "partners" | "bookings" | "payouts" | "notifications" | "settings" | "sessions";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [payoutSummary, setPayoutSummary] = useState<{totalRevenue: number; totalCommission: number; pendingPayouts: number; completedPayouts: number} | null>(null);
  
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [settings, setSettings] = useState({ platformUpiId: "", platformUpiQrCode: "" });
  const [settingsForm, setSettingsForm] = useState({ platformUpiId: "", platformUpiQrCode: "" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const settingsQrRef = useRef<HTMLInputElement>(null);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [sessionsView, setSessionsView] = useState<string>("all");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(userData);
      if (parsed.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(parsed);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      fetchData();
      fetchNotifications();
    }
  }, [loading, activeTab, user]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminNotifications(data.data.notifications);
        setAdminUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      if (activeTab === "artists") {
        const res = await fetch("/api/admin/data?type=artists");
        const data = await res.json();
        if (data.success) setArtists(data.data);
      } else if (activeTab === "partners") {
        const res = await fetch("/api/admin/data?type=partners");
        const data = await res.json();
        if (data.success) setPartners(data.data);
      } else if (activeTab === "bookings") {
        const res = await fetch("/api/admin/data?type=bookings");
        const data = await res.json();
        if (data.success) setBookings(data.data);
      } else if (activeTab === "analytics") {
        const res = await fetch("/api/admin/data?type=analytics");
        const data = await res.json();
        if (data.success) setAnalytics(data.data);
      } else if (activeTab === "payouts") {
        const res = await fetch("/api/admin/payouts?action=summary");
        const data = await res.json();
        if (data.success) setPayoutSummary(data.data);
      } else if (activeTab === "notifications") {
        await fetchNotifications();
      } else if (activeTab === "settings") {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
          setSettingsForm({ platformUpiId: data.data.platformUpiId || "", platformUpiQrCode: data.data.platformUpiQrCode || "" });
        }
      } else if (activeTab === "sessions") {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/sessions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setAllSessions(data.data.sessions);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDelete = async (id: string, model: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const res = await fetch(`/api/admin/data?id=${id}&model=${model}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  const handleViewProfile = async (id: string, type: "artist" | "partner") => {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/admin/profile?id=${id}&type=${type}`);
      const data = await res.json();
      if (data.success) {
        setSelectedProfile({ type, data: data.data });
      } else {
        alert("Failed to load profile");
      }
    } catch {
      alert("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "analytics", label: "Analytics", icon: DollarSign },
    { id: "artists", label: "Artists", icon: Mic2 },
    { id: "partners", label: "Partners", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "payouts", label: "Payouts", icon: CreditCard },
    { id: "sessions", label: "Sessions", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Payment Settings", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <aside className="w-64 bg-brand-surface border-r border-white/[0.06] fixed h-full">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <span className="text-xl font-display font-bold">
              <span className="gradient-text">Vibe</span>
              <span className="text-white">Stage</span>
            </span>
          </Link>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-gradient text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.id === "notifications" && adminUnreadCount > 0 && (
                  <span className="ml-auto bg-brand-pink text-white text-xs px-2 py-0.5 rounded-full">{adminUnreadCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-white/40">Platform analytics and management</p>
            </div>
          </div>

          {activeTab === "analytics" && (
            <div>
              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-orange/20 flex items-center justify-center">
                        <Mic2 className="w-6 h-6 text-brand-orange" />
                      </div>
                      <div>
                        <p className="text-white/50 text-sm">Total Artists</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalArtists}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-pink/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-brand-pink" />
                      </div>
                      <div>
                        <p className="text-white/50 text-sm">Event Partners</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalPartners}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white/50 text-sm">Total Bookings</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange to-brand-pink flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/50 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold gradient-text">₹{analytics.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-white/50">No analytics data</div>
              )}
              
              {analytics && (
                  <div className="mt-6 glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-white/50 text-sm">Total Revenue</p>
                      <p className="text-xl font-bold text-white">₹{analytics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Commission (30%)</p>
                      <p className="text-xl font-bold gradient-text">₹{analytics.commission.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "artists" && (
            <div>
              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : artists.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Artist</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Email</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Phone</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Genre</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Location</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Rate</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Registered</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artists.map((artist) => (
                        <tr key={artist._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {artist.name}
                                  {(artist as any).isVerified ? (
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-semibold align-middle">Verified</span>
                                  ) : (
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 font-semibold align-middle">Unverified</span>
                                  )}
                                </p>
                                <p className="text-white/40 text-xs">{artist.bio || "No bio"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-white/70">{artist.email}</td>
                          <td className="py-4 px-4 text-white/70">{artist.phone || "-"}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-brand-orange/20 text-brand-orange">{artist.genre}</span>
                          </td>
                          <td className="py-4 px-4 text-white/70">{artist.location}</td>
                          <td className="py-4 px-4 text-white/70">₹{artist.price?.toLocaleString()}</td>
                          <td className="py-4 px-4 text-white/50 text-sm">
                            {new Date(artist.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {(artist as any).isVerified ? (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    await fetch("/api/admin/users", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ userId: artist._id, action: "unverify", type: "artist" })
                                    });
                                    fetchData();
                                  }}
                                  className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                  title="Unverify Artist"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    await fetch("/api/admin/users", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ userId: artist._id, action: "verify", type: "artist" })
                                    });
                                    fetchData();
                                  }}
                                  className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  title="Verify Artist"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {artist.image && (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    if (!confirm("Delete this artist's profile picture?")) return;
                                    const res = await fetch("/api/admin/users", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ userId: artist._id, action: "deleteProfileImage", type: "artist" })
                                    });
                                    const data = await res.json();
                                    if (data.success) fetchData();
                                  }}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30"
                                  title="Delete Profile Picture"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleViewProfile(artist._id, "artist")}
                                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(artist._id, "artist")}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 glass-card">
                  <p className="text-white/50 text-lg">No artists registered yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "partners" && (
            <div>
              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : partners.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Name</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Email</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Phone</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Location</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Registered</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map((partner) => (
                        <tr key={partner._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="py-4 px-4 text-white font-medium">{partner.name}</td>
                          <td className="py-4 px-4 text-white/70">{partner.email}</td>
                          <td className="py-4 px-4 text-white/70">{partner.phone || "-"}</td>
                          <td className="py-4 px-4 text-white/70">{partner.location || "-"}</td>
                          <td className="py-4 px-4 text-white/50 text-sm">
                            {new Date(partner.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {(partner as any).profileImage && (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    if (!confirm("Delete this partner's profile picture?")) return;
                                    const res = await fetch("/api/admin/users", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ userId: partner._id, action: "deleteProfileImage", type: "partner" })
                                    });
                                    const data = await res.json();
                                    if (data.success) fetchData();
                                  }}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30"
                                  title="Delete Profile Picture"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleViewProfile(partner._id, "partner")}
                                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(partner._id, "partner")}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 glass-card">
                  <p className="text-white/50 text-lg">No event partners registered yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Event</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Artist</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Organizer</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Date/Venue</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Amount</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Status</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Payment</th>
                        <th className="text-left py-4 px-4 text-white/50 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="py-4 px-4 text-white font-medium">{booking.eventName}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {booking.artistId?.image && (
                                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                                  <Image src={booking.artistId.image} alt="" fill className="object-cover" />
                                </div>
                              )}
                              <span className="text-white/70">{booking.artistId?.name || "N/A"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-white/70">{booking.organizerEmail}</td>
                          <td className="py-4 px-4 text-white/70">
                            {booking.acceptedDate
                              ? `${new Date(booking.acceptedDate).toLocaleDateString()}${booking.acceptedVenue ? ` @ ${booking.acceptedVenue}` : ""}`
                              : booking.date
                                ? new Date(booking.date).toLocaleDateString()
                                : "TBD"}
                          </td>
                          <td className="py-4 px-4 text-white/70">₹{booking.budget?.toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === "completed" ? "bg-green-500/20 text-green-400" :
                              booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                              booking.status === "accepted" ? "bg-blue-500/20 text-blue-400" :
                              booking.status === "awaiting_confirmation" ? "bg-purple-500/20 text-purple-400" :
                              booking.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {booking.status === "awaiting_confirmation" ? "Verify Payment" :
                               booking.status === "confirmed" ? "Confirmed" : booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 text-xs">
                              {booking.paymentType && (booking.status === "awaiting_confirmation" || booking.status === "confirmed") && (
                                <span className="text-brand-orange">{booking.paymentType === "advance" ? "30% Advance" : "Full Payment"}</span>
                              )}
                              {booking.organizerPaidAdmin && (
                                <span className="text-green-400">Org Paid Admin ✓</span>
                              )}
                              {booking.adminPaidArtist && (
                                <span className="text-green-400">Admin Paid Artist ✓</span>
                              )}
                              {!booking.organizerPaidAdmin && booking.status === "accepted" && (
                                <span className="text-orange-400">Awaiting Org Payment</span>
                              )}
                              {booking.status === "awaiting_confirmation" && (
                                <span className="text-purple-400">Proof Submitted</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {/* Payment Verification - Approve/Reject */}
                              {booking.status === "awaiting_confirmation" && (
                                <>
                                  {booking.paymentProof?.screenshot && (
                                    <button
                                      onClick={() => window.open(booking.paymentProof.screenshot, "_blank")}
                                      className="px-2 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:text-white text-xs"
                                      title="View payment proof"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={async () => {
                                      const token = localStorage.getItem("token");
                                      if (!confirm("Confirm payment and approve booking?")) return;
                                      const res = await fetch("/api/partner/bookings", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ bookingId: booking._id, action: "adminConfirmPayment" })
                                      });
                                      const data = await res.json();
                                      if (data.success) fetchData();
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium"
                                    title="Approve payment"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const token = localStorage.getItem("token");
                                      if (!confirm("Reject this payment proof?")) return;
                                      const res = await fetch("/api/partner/bookings", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ bookingId: booking._id, action: "adminRejectPayment" })
                                      });
                                      const data = await res.json();
                                      if (data.success) fetchData();
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium"
                                    title="Reject payment"
                                  >
                                    <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject
                                  </button>
                                </>
                              )}

                              {/* Confirmed Full Payment - Pay Artist button */}
                              {booking.status === "confirmed" && booking.paymentType === "full" && !booking.adminPaidArtist && (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    if (!confirm(`Release ₹${(booking.artistPayout || booking.basePrice || 0).toLocaleString()} to artist?`)) return;
                                    const res = await fetch("/api/partner/bookings", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ bookingId: booking._id, action: "adminPaysArtist" })
                                    });
                                    const data = await res.json();
                                    if (data.success) fetchData();
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium"
                                  title="Release payment to artist"
                                >
                                  Pay Artist
                                </button>
                              )}

                              {/* Confirmed Full Payment - Done */}
                              {booking.status === "confirmed" && booking.paymentType === "full" && booking.adminPaidArtist && (
                                <span className="px-2 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs">
                                  Payment done. Check your bank.
                                </span>
                              )}

                              {/* Confirmed Advance Payment - Ask rest */}
                              {booking.status === "confirmed" && booking.paymentType === "advance" && (
                                <span className="px-2 py-1.5 rounded-lg bg-brand-orange/10 text-brand-orange text-xs max-w-[200px]">
                                  Advance received. Ask rest ₹{((booking.finalPrice || 0) - (booking.advanceAmount || Math.round((booking.finalPrice || 0) * 0.3))).toLocaleString()} from organizer before show.
                                </span>
                              )}

                              {/* Admin Pays Artist button (for old flow) */}
                              {booking.organizerPaidAdmin && !booking.adminPaidArtist && booking.status === "accepted" && (
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    if (!confirm(`Release ₹${(booking.artistPayout || booking.basePrice || 0).toLocaleString()} to artist?`)) return;
                                    const res = await fetch("/api/partner/bookings", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ bookingId: booking._id, action: "adminPaysArtist" })
                                    });
                                    const data = await res.json();
                                    if (data.success) fetchData();
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium"
                                  title="Release payment to artist"
                                >
                                  Pay Artist
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(booking._id, "booking")}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 glass-card">
                  <p className="text-white/50 text-lg">No bookings yet</p>
                </div>
              )}
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <div>
              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : payoutSummary ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card p-6">
                      <p className="text-white/40 text-sm mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold gradient-text">₹{payoutSummary.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-6">
                      <p className="text-white/40 text-sm mb-1">Total Commission (30%)</p>
                      <p className="text-2xl font-bold text-green-400">₹{payoutSummary.totalCommission.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-6">
                      <p className="text-white/40 text-sm mb-1">Pending Payouts</p>
                      <p className="text-2xl font-bold text-brand-orange">₹{payoutSummary.pendingPayouts.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-6">
                      <p className="text-white/40 text-sm mb-1">Completed Payouts</p>
                      <p className="text-2xl font-bold text-white">₹{payoutSummary.completedPayouts.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Pending Payouts List */}
                  <div className="glass-card p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Payouts to Artists</h3>
                    {bookings.filter(b => b.organizerPaidAdmin && !b.adminPaidArtist).length > 0 ? (
                      <div className="space-y-3">
                        {bookings.filter(b => b.organizerPaidAdmin && !b.adminPaidArtist).map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04]">
                            <div>
                              <p className="text-white font-medium">{booking.eventName}</p>
                              <p className="text-sm text-white/40">
                                {booking.artistId?.name} • ₹{(booking.artistPayout || booking.basePrice || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-white/40">{booking.organizerEmail}</span>
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  if (!confirm(`Release ₹${(booking.artistPayout || booking.basePrice || 0).toLocaleString()} to ${booking.artistId?.name}?`)) return;
                                  const res = await fetch("/api/partner/bookings", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ bookingId: booking._id, action: "adminPaysArtist" })
                                  });
                                  const data = await res.json();
                                  if (data.success) fetchData();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium"
                              >
                                Release Payment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40">No pending payouts</p>
                    )}
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payout Instructions</h3>
                    <div className="space-y-3 text-white/60 text-sm">
                      <p>• When organizer pays full amount, admin releases payment to artist</p>
                      <p>• For advance payments (30%), organizer pays admin 30% and remaining to artist directly</p>
                      <p>• Artist UPI details are visible in their profile for manual transfer</p>
                      <p>• Commission (30%) is automatically calculated from booking amount</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-white/50">No payout data</div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-6">Active Sessions</h2>
              <p className="text-white/40 text-sm mb-6">
                Showing your active login sessions. Admins can have up to 5 concurrent sessions.
              </p>

              {dataLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                </div>
              ) : allSessions.length > 0 ? (
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
                      {allSessions.map((session: any, idx: number) => (
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
                                if (!confirm("Terminate this session? The user will be logged out.")) return;
                                const res = await fetch(`/api/sessions?sessionId=${session._id}`, {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                if (data.success) {
                                  if (data.currentSessionTerminated) {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user");
                                    router.replace("/login");
                                    return;
                                  }
                                  const token2 = localStorage.getItem("token");
                                  const res2 = await fetch("/api/sessions", {
                                    headers: { Authorization: `Bearer ${token2}` }
                                  });
                                  const data2 = await res2.json();
                                  if (data2.success) setAllSessions(data2.data.sessions);
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

          {/* Payment Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-display font-bold text-white mb-6">Payment Settings</h2>

              {settingsMsg && (
                <div className={`mb-6 p-4 rounded-xl ${settingsMsg.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                  {settingsMsg}
                </div>
              )}

              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Platform UPI QR Code</h3>
                  <p className="text-sm text-white/40 mb-4">
                    This QR code and UPI ID will be shown to organizers when they need to make payments for bookings.
                  </p>

                  {settingsForm.platformUpiQrCode ? (
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-white/[0.08] mb-4">
                      <Image src={settingsForm.platformUpiQrCode} alt="Platform UPI QR" fill className="object-contain" />
                      <button
                        onClick={() => setSettingsForm({ ...settingsForm, platformUpiQrCode: "" })}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white"
                        title="Remove QR code"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => settingsQrRef.current?.click()}
                      className="flex flex-col items-center justify-center w-48 h-48 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-brand-orange/50 cursor-pointer transition-colors mb-4"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Upload QR Code</span>
                    </div>
                  )}
                  <input
                    ref={settingsQrRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ file: reader.result, folder: "settings" })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setSettingsForm({ ...settingsForm, platformUpiQrCode: data.url });
                          } else {
                            alert(data.error || "Upload failed");
                          }
                        } catch (err) {
                          console.error("Upload error:", err);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Platform UPI ID</h3>
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">UPI ID</label>
                    <input
                      type="text"
                      value={settingsForm.platformUpiId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, platformUpiId: e.target.value })}
                      placeholder="e.g. vibestage@upi"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
                    />
                    <p className="text-xs text-white/30 mt-2">
                      Organizers will see this UPI ID and QR code when making payments for bookings.
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!token) return;
                    setSavingSettings(true);
                    setSettingsMsg("");
                    try {
                      const res = await fetch("/api/admin/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify(settingsForm)
                      });
                      const data = await res.json();
                      if (data.success) {
                        setSettings(data.data);
                        setSettingsMsg("Payment settings updated successfully!");
                        setTimeout(() => setSettingsMsg(""), 3000);
                      } else {
                        setSettingsMsg("Error: " + (data.error || "Failed to update"));
                      }
                    } catch (err) {
                      console.error("Save settings error:", err);
                      setSettingsMsg("Error: Failed to save settings");
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  disabled={savingSettings}
                  className="btn-primary w-full"
                >
                  {savingSettings ? "Saving..." : "Save Payment Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white">Notifications</h2>
                {adminUnreadCount > 0 && (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await fetch("/api/admin/notifications", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({})
                      });
                      fetchNotifications();
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] text-white/60 hover:text-white text-sm"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {adminNotifications.length > 0 ? (
                <div className="space-y-3">
                  {adminNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={async () => {
                        if (!notif.isRead) {
                          const token = localStorage.getItem("token");
                          await fetch("/api/admin/notifications", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ notificationId: notif._id })
                          });
                          fetchNotifications();
                        }
                      }}
                      className={`glass-card p-4 cursor-pointer transition-all ${
                        !notif.isRead ? "border-l-4 border-l-brand-orange" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{notif.title}</p>
                          <p className="text-sm text-white/60 mt-1">{notif.message}</p>
                          <p className="text-xs text-white/30 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-2" />
                        )}
                      </div>

                      {/* Delete request actions */}
                      {notif.title === "Account Deletion Request" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const token = localStorage.getItem("token");
                              const email = notif.message.match(/\(([^)]+)\)/)?.[1];
                              if (!email) { alert("Could not extract email from notification"); return; }
                              const res = await fetch("/api/admin/delete-user", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ email, action: "approve" })
                              });
                              const data = await res.json();
                              if (data.success) {
                                fetchNotifications();
                                fetchData();
                              } else {
                                alert(data.error || "Failed to approve deletion");
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium"
                          >
                            <Check className="w-3 h-3 inline mr-1" /> Approve Delete
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const token = localStorage.getItem("token");
                              const email = notif.message.match(/\(([^)]+)\)/)?.[1];
                              if (!email) { alert("Could not extract email from notification"); return; }
                              const res = await fetch("/api/admin/delete-user", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ email, action: "reject" })
                              });
                              const data = await res.json();
                              if (data.success) {
                                fetchNotifications();
                              } else {
                                alert(data.error || "Failed to reject deletion");
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium"
                          >
                            <X className="w-3 h-3 inline mr-1" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-white/20 mb-4" />
                  <p className="text-white/40">No notifications yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedProfile.type === "artist" ? "Artist Details" : "Partner Details"}
              </h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedProfile.type === "artist" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden relative">
                    <Image src={(selectedProfile.data as Artist).image} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{(selectedProfile.data as Artist).name}</h3>
                    <p className="text-white/50">{(selectedProfile.data as Artist).email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-sm">Phone</p>
                    <p className="text-white">{(selectedProfile.data as Artist).phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Location</p>
                    <p className="text-white">{(selectedProfile.data as Artist).location}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Genre</p>
                    <p className="text-white">{(selectedProfile.data as Artist).genre}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Price</p>
                    <p className="text-white">₹{(selectedProfile.data as Artist).price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Rating</p>
                    <p className="text-white">{(selectedProfile.data as Artist).rating || 0}/5</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Available</p>
                    <p className="text-white">{(selectedProfile.data as Artist).isAvailable ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-sm">Bio</p>
                  <p className="text-white">{(selectedProfile.data as Artist).bio || "No bio available"}</p>
                </div>
                {(selectedProfile.data as Artist).languages && (selectedProfile.data as Artist).languages!.length > 0 && (
                  <div>
                    <p className="text-white/40 text-sm">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(selectedProfile.data as Artist).languages!.map((lang, i) => (
                        <span key={i} className="px-2 py-1 rounded-full text-xs bg-brand-orange/20 text-brand-orange">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedProfile.data as Artist).socialLinks && (
                  <div>
                    <p className="text-white/40 text-sm mb-2">Social Links</p>
                    <div className="flex gap-4">
                      {(selectedProfile.data as Artist).socialLinks!.instagram && (
                        <a href={(selectedProfile.data as Artist).socialLinks?.instagram} target="_blank" className="text-brand-orange hover:underline">Instagram</a>
                      )}
                      {(selectedProfile.data as Artist).socialLinks!.youtube && (
                        <a href={(selectedProfile.data as Artist).socialLinks?.youtube} target="_blank" className="text-brand-orange hover:underline">YouTube</a>
                      )}
                      {(selectedProfile.data as Artist).socialLinks!.website && (
                        <a href={(selectedProfile.data as Artist).socialLinks?.website} target="_blank" className="text-brand-orange hover:underline">Website</a>
                      )}
                    </div>
                  </div>
                )}

                {/* UPI Payment Details - Admin Only */}
                <div className="mt-4 p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/30">
                  <p className="text-sm text-brand-orange font-semibold mb-2">UPI Payment Details (Admin Only)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-xs">UPI ID</p>
                      <p className="text-white font-medium">{(selectedProfile.data as Artist).upiId || "Not set"}</p>
                    </div>
                  </div>
                  {(selectedProfile.data as Artist).upiQrCode && (
                    <div className="mt-2">
                      <p className="text-white/40 text-xs mb-1">UPI QR Code</p>
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/[0.08]">
                        <Image src={(selectedProfile.data as Artist).upiQrCode!} alt="UPI QR" width={96} height={96} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-sm">Name</p>
                  <p className="text-white text-lg font-medium">{(selectedProfile.data as Partner).name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-sm">Email</p>
                    <p className="text-white">{(selectedProfile.data as Partner).email}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Phone</p>
                    <p className="text-white">{(selectedProfile.data as Partner).phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Location</p>
                    <p className="text-white">{(selectedProfile.data as Partner).location || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Registered On</p>
                    <p className="text-white">{new Date((selectedProfile.data as Partner).createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}