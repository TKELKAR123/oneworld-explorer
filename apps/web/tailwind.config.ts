import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      lineHeight: {
        relaxed: "1.625",
        snug: "1.375",
      },
      colors: {
        surface: {
          DEFAULT: "#0f1419",
          card: "#1a2332",
          border: "#2a3648",
          muted: "#9aa7b8",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "#166534",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "#78350f",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "#7f1d1d",
        },
        continent: {
          "europe-middle-east": "#6366f1",
          africa: "#eab308",
          asia: "#22c55e",
          "south-west-pacific": "#06b6d4",
          "north-america": "#3b82f6",
          "south-america": "#f97316",
        },
      },
    },
  },
  plugins: [],
};

export default config;
