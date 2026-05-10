"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";

type AuthType = "artist" | "partner" | "admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authType, setAuthType] = useState<AuthType>("artist");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    genre: "",
    location: "",
    price: 0,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "artist") setAuthType("artist");
    else if (role === "partner") setAuthType("partner");
    else if (role === "admin") setAuthType("admin");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = isLogin 
      ? `/api/auth/login?role=${authType === "artist" ? "artist" : authType === "partner" ? "event_partner" : "admin"}` 
      : "/api/auth/register";
    const body = isLogin
      ? { email: form.email, password: form.password }
      : {
          name: form.name,
          email: form.email,
          password: form.password,
          role: authType === "artist" ? "artist" : authType === "partner" ? "event_partner" : "admin",
          ...(authType === "artist" ? { genre: form.genre, location: form.location, price: form.price, image: form.image } : {})
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        const role = data.data.user.role;
        if (role === "artist") {
          router.push("/artist/dashboard");
        } else if (role === "event_partner") {
          router.push("/partner/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        }
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Welcome to <span className="gradient-text">VibeStage</span>
        </h1>
        <p className="text-white/40 mt-2">Choose how you want to continue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <button
          onClick={() => setAuthType("artist")}
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            authType === "artist"
              ? "bg-brand-gradient border-transparent shadow-glow-sm"
              : "bg-white/[0.04] border-white/[0.08] hover:border-white/20"
          }`}
        >
          <div className="text-3xl mb-3">🎤</div>
          <h3 className="text-lg font-semibold text-white">Artist</h3>
          <p className="text-sm text-white/50 mt-1">Signup / Login as performer</p>
        </button>
        <button
          onClick={() => setAuthType("partner")}
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            authType === "partner"
              ? "bg-brand-gradient border-transparent shadow-glow-sm"
              : "bg-white/[0.04] border-white/[0.08] hover:border-white/20"
          }`}
        >
          <div className="text-3xl mb-3">🎪</div>
          <h3 className="text-lg font-semibold text-white">Event Partner</h3>
          <p className="text-sm text-white/50 mt-1">Signup / Login as organizer</p>
        </button>
        <button
          onClick={() => setAuthType("admin")}
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            authType === "admin"
              ? "bg-brand-gradient border-transparent shadow-glow-sm"
              : "bg-white/[0.04] border-white/[0.08] hover:border-white/20"
          }`}
        >
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold text-white">Admin</h3>
          <p className="text-sm text-white/50 mt-1">Login only</p>
        </button>
      </div>

      <div className="glass-card p-8 md:p-10 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-display font-bold text-white">
            {authType === "artist" && (isLogin ? "Artist Login" : "Artist Signup")}
            {authType === "partner" && (isLogin ? "Partner Login" : "Partner Signup")}
            {authType === "admin" && "Admin Login"}
          </h2>
          <p className="text-sm text-white/40 mt-2">
            {authType === "admin" ? "Administrator access" : (isLogin ? "Sign in to your account" : "Create your account")}
          </p>
        </div>

        {authType !== "admin" && (
          <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-brand-gradient text-white shadow-glow-sm"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-brand-gradient text-white shadow-glow-sm"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                />
              </div>
              {authType === "artist" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-1.5">Genre / Category</label>
                    <input
                      type="text"
                      required
                      value={form.genre}
                      onChange={(e) => setForm({ ...form, genre: e.target.value })}
                      placeholder="Electronic, Rock, Pop..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-1.5">City / Location</label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Mumbai, Delhi..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-1.5">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
                      placeholder="15000"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                    />
                  </div>
                </>
              )}
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`text-sm text-center py-2 rounded-lg ${
                message.includes("Welcome") || message.includes("Login successful")
                  ? "text-green-400 bg-green-400/10"
                  : "text-red-400 bg-red-400/10"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !mt-6"
          >
            <span>{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="relative w-full max-w-6xl">
      <div className="text-center mb-10">
        <div className="h-10 w-64 mx-auto bg-white/[0.04] rounded-xl animate-pulse" />
      </div>
      <div className="glass-card p-8 md:p-10 max-w-md mx-auto">
        <div className="h-6 w-32 mx-auto bg-white/[0.04] rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-orange opacity-20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-glow-pink opacity-15 blur-3xl" />
        </div>
        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
