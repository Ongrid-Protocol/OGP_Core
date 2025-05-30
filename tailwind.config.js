/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 