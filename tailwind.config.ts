import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#f8f9fc",
          100: "#eef1f8",
          200: "#d8deec",
          300: "#b3bed5",
          400: "#8596b4",
          500: "#657899",
          600: "#4f5f7d",
          700: "#404d66",
          800: "#2a3140",
          900: "#181d27",
          950: "#0d1117",
        },
        accent: {
          DEFAULT: "#6c63ff",
          muted: "#2d2a5e",
          hover: "#5a52e0",
          light: "#8b85ff",
        },
        gold: {
          DEFAULT: "#d4a853",
          light: "#e8c97a",
          dark: "#b08a3a",
          muted: "#3d3424",
        },
        brand: {
          navy: "#0f1628",
          deep: "#111827",
          slate: "#1e2536",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2)",
        "card-hover":
          "0 8px 25px -5px rgb(0 0 0 / 0.3), 0 4px 10px -6px rgb(0 0 0 / 0.2)",
        glow: "0 0 20px rgba(108, 99, 255, 0.15)",
        "gold-glow": "0 0 30px rgba(212, 168, 83, 0.12)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0f1628 0%, #111827 50%, #1a1f33 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
