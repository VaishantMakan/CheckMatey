/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          777: "#D9E4E7",
          778: "#7599AE",
        },
      },
    },
  },
  plugins: [],
};
