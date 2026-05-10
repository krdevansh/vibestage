import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF7A18",
          pink: "#FF0058",
          bg: "#0A0A0A",
          surface: "#121212",
          card: "#1A1A2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF7A18 0%, #FF0058 100%)",
        "brand-gradient-r": "linear-gradient(135deg, #FF0058 0%, #FF7A18 100%)",
        "hero-radial":
          "radial-gradient(ellipse at 50% 0%, rgba(255,122,24,0.15) 0%, rgba(255,0,88,0.08) 40%, transparent 70%)",
        "glow-orange":
          "radial-gradient(circle, rgba(255,122,24,0.4) 0%, transparent 70%)",
        "glow-pink":
          "radial-gradient(circle, rgba(255,0,88,0.35) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(255,122,24,0.3), 0 0 60px rgba(255,0,88,0.15)",
        "glow-sm":
          "0 0 15px rgba(255,122,24,0.2), 0 0 30px rgba(255,0,88,0.1)",
        "glow-lg":
          "0 0 50px rgba(255,122,24,0.4), 0 0 100px rgba(255,0,88,0.2)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        equalizer: "equalizerBounce 1.2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        equalizerBounce: {
          "0%, 100%": { height: "8px" },
          "50%": { height: "28px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
