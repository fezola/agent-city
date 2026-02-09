import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['"VT323"', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        rpg: {
          panel: "#0a1628",
          "panel-border": "#1e3a5f",
          "panel-glow": "#4fc3f7",
          gold: "#ffd700",
          "gold-dim": "#b8860b",
          "hp-green": "#00e676",
          "hp-red": "#ff1744",
          "mana-blue": "#448aff",
          "xp-purple": "#e040fb",
          "safe-green": "#76ff03",
          lantern: "#ffab40",
          "lantern-glow": "#ff6d00",
          ground: "#1a2332",
          "ground-light": "#263545",
          water: "#0d47a1",
          grass: "#1b5e20",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-30px) scale(0.5)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0)" },
          "50%": { boxShadow: "0 0 12px 4px rgba(52, 211, 153, 0.3)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "protest-wave": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-15deg)" },
          "75%": { transform: "rotate(15deg)" },
        },
        "lantern-flicker": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.15)" },
        },
        "pixel-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "water-flow": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 0" },
        },
        "smoke-rise": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "100%": { transform: "translateY(-16px) scale(0.3)", opacity: "0" },
        },
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 4px rgba(79,195,247,0.3), inset 0 0 4px rgba(0,0,0,0.5)" },
          "50%": { boxShadow: "0 0 12px rgba(79,195,247,0.5), inset 0 0 4px rgba(0,0,0,0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 1.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "sparkle": "sparkle 0.8s ease-in-out",
        "protest-wave": "protest-wave 0.6s ease-in-out infinite",
        "lantern-flicker": "lantern-flicker 3s ease-in-out infinite",
        "pixel-bounce": "pixel-bounce 0.4s ease-in-out",
        "water-flow": "water-flow 2s linear infinite",
        "smoke-rise": "smoke-rise 2s ease-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
