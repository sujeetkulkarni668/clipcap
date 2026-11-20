import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          primary: "#3b82f6",
          accent: "#00F0FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        anton: ["Anton", "sans-serif"],
        archivo: ["Archivo Black", "sans-serif"],
        poppins: ["Poppins ExtraBold", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
