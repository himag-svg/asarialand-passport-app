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
          50: "#faf9f7",
          100: "#f0ede8",
          200: "#ddd8cf",
          300: "#c4bdb0",
          400: "#a69b8a",
          500: "#8d8070",
          600: "#736659",
          700: "#5a4f43",
          800: "#1e1b16",
          900: "#151310",
          950: "#0c0b09",
        },
        accent: {
          DEFAULT: "#0ea5e9",
          muted: "#0c4a6e",
          hover: "#0284c7",
          light: "#38bdf8",
        },
        gold: {
          DEFAULT: "#d4a853",
          light: "#e8c97a",
          dark: "#b08a3a",
          muted: "#3d3424",
        },
        ocean: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        coral: {
          DEFAULT: "#f97316",
          light: "#fb923c",
        },
        palm: {
          DEFAULT: "#22c55e",
          light: "#4ade80",
        },
        brand: {
          navy: "#0c1220",
          deep: "#0f1628",
          slate: "#1a2332",
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
        glow: "0 0 20px rgba(14, 165, 233, 0.15)",
        "gold-glow": "0 0 30px rgba(212, 168, 83, 0.12)",
        "ocean-glow": "0 0 30px rgba(14, 165, 233, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0c1220 0%, #0f1628 40%, #0d2137 100%)",
        "tropical-gradient":
          "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(20, 184, 166, 0.04) 50%, rgba(34, 197, 94, 0.02) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
        float: "float 6s ease-in-out infinite",
        wave: "wave 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
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
          "50%": { transform: "translateY(-8px)" },
        },
        wave: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "25%": { transform: "translateX(5px) translateY(-3px)" },
          "50%": { transform: "translateX(0) translateY(-6px)" },
          "75%": { transform: "translateX(-5px) translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
