/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#EEF1F5",
          100: "#D6DCE6",
          300: "#8C9AB3",
          500: "#3D4A66",
          700: "#222C42",
          900: "#141B2B",
          950: "#0D1220",
        },
        amber: {
          50: "#FEF6E7",
          200: "#FBDA9C",
          500: "#D97706",
          600: "#B45F04",
        },
        safe: {
          50: "#EBF7EF",
          500: "#15803D",
          600: "#0F6B31",
        },
        alert: {
          50: "#FCE9E9",
          500: "#B91C1C",
          600: "#991616",
        },
        paper: "#F7F6F2",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(13,18,32,0.06), 0 1px 0 rgba(13,18,32,0.04)",
      },
    },
  },
  plugins: [],
};
