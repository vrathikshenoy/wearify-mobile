/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#FBF7F1",
        surface: "#FFFFFF",
        ink: "#1C1108",
        muted: "#6B5744",
        brand: "#68262A",
        gold: "#B8860B"
      }
    }
  },
  plugins: []
};
