import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hud: "#0A0D10",
        hud2: "#0D0F14",
        hudLine: "rgba(255, 60, 60, 0.35)",
        hudLineStrong: "rgba(255, 60, 60, 0.70)",
        hudText: "rgba(255,255,255,0.88)",
        hudDim: "rgba(255,255,255,0.62)",
        hudRed: "#FF3C3C",
        hudRed2: "#FF5A5A",
      },
      fontFamily: {
        hud: ["var(--font-raj)", "system-ui", "sans-serif"],
        hudTitle: ["var(--font-orb)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        hud: "0 0 0 1px rgba(255,60,60,.35), 0 0 18px rgba(255,60,60,.12)",
        hudStrong: "0 0 0 1px rgba(255,60,60,.65), 0 0 28px rgba(255,60,60,.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
