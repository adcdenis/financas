module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0C121C",
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
          600: "#4B5563",
          500: "#6B7280",
          300: "#D1D5DB",
          200: "#E5E7EB",
          100: "#F3F4F6",
        },
        brand: {
          700: "#0F766E",
          600: "#0D9488",
          500: "#14B8A6",
          200: "#99F6E4",
        },
        sand: {
          50: "#F8F6F1",
          100: "#F1EEE7",
          200: "#E6E1D7",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
        card: "0 12px 30px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
