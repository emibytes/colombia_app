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
        // Colombia flag
        col: {
          yellow: "#FCD116",
          blue:   "#003087",
          red:    "#CE1126",
        },
        // Dark palette
        dark:  "#05080F",
        card:  "#0C1018",
        card2: "#111620",
      },
      fontFamily: {
        display:  ["var(--font-bebas)",    "sans-serif"],
        heading:  ["var(--font-barlow)",   "sans-serif"],
        body:     ["var(--font-jakarta)",  "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fluid:  "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.85) rotate(-8deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "ripple": {
          "0%":   { transform: "scale(0)", opacity: "0.4" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "confetti-fall": {
          "0%":   { transform: "translateY(-20px) rotate(0deg)",   opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(252,209,22,0.2)" },
          "50%":      { boxShadow: "0 0 40px rgba(252,209,22,0.5)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
      },
      animation: {
        "fade-up":      "fade-up 0.7s cubic-bezier(0.32, 0.72, 0, 1) both",
        "scale-in":     "scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "ripple":       "ripple 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "confetti":     "confetti-fall 2s ease-in forwards",
        "pulse-glow":   "pulse-glow 2s ease-in-out infinite",
        "shimmer":      "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "col-gradient": "linear-gradient(135deg, #FCD116 0%, #CE1126 100%)",
        "blue-gradient": "linear-gradient(135deg, #003087 0%, #0050C8 100%)",
        "card-gradient": "linear-gradient(135deg, #0C1018 0%, #111620 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(252,209,22,0.08) 50%, transparent 100%)",
      },
      boxShadow: {
        "yellow-glow":  "0 0 32px rgba(252,209,22,0.25)",
        "yellow-glow-lg": "0 0 60px rgba(252,209,22,0.35)",
        "card-inset":   "inset 0 1px 1px rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
