import type { Config } from "tailwindcss";

/**
 * Grand Venue — Design System v1.0
 * Tokens espelhados em src/app/globals.css (CSS variables).
 * NÃO improvisar cores: usar apenas o que está mapeado aqui.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: { DEFAULT: "#2563EB", dark: "#1D4ED8", faint: "#EEF2FF" },
        ink: {
          DEFAULT: "#0F172A",
          2: "#475569",
          3: "#94A3B8",
          4: "#CBD5E1",
        },
        surface: { DEFAULT: "#F8FAFC", 2: "#F1F5F9" },
        border: { DEFAULT: "#E2E8F0", 2: "#CBD5E1" },
        green: { DEFAULT: "#059669", bg: "#F0FDF4", bor: "#BBF7D0" },
        amber: { DEFAULT: "#D97706", bg: "#FFFBEB", bor: "#FDE68A" },
        red: { DEFAULT: "#DC2626", bg: "#FEF2F2", bor: "#FECACA" },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(37,99,235,.07)",
        "card-hover": "0 0 0 3px rgba(37,99,235,.06)",
        selected: "0 0 0 3px rgba(37,99,235,.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: {
        label: "0.06em",
      },
    },
  },
  plugins: [],
};

export default config;
