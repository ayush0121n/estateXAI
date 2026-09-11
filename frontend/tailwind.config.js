/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121820',
        accent: '#B68A5E',
        surface: '#F5F1EB',
        elevated: '#F7F4ED',
        muted: '#6B6B6B',
        borderSubtle: '#767676',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        btn: '10px',
        card: '12px',
      },
    },
  },
  plugins: [],
}
