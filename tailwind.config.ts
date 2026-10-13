import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mechanic: {
          dark: "#0b1120",
          card: "#131b2e",
          cardHover: "#1b253d",
          border: "#24324f",
          accent: "#f97316", // Safety high-visibility orange
          accentHover: "#ea580c",
          cyan: "#0284c7",
          safe: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          muted: "#94a3b8",
        },
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
