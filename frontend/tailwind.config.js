/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand Colors (Sahyadri / PlacementPro) ──────────────
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",   // ← main brand blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Semantic status colors
        success: { DEFAULT: "#22c55e", light: "#dcfce7", dark: "#16a34a" },
        danger: { DEFAULT: "#ef4444", light: "#fee2e2", dark: "#dc2626" },
        warning: { DEFAULT: "#f59e0b", light: "#fef3c7", dark: "#d97706" },
        neutral: { DEFAULT: "#6b7280", light: "#f3f4f6", dark: "#374151" },
      },
      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      // ── Animations ──────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        "fade-in": "fade-in 0.2s ease-out",
        "bounce-dot": "bounce-dot 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require, no-undef
    require('@tailwindcss/typography'),
  ],
};
