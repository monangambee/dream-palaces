/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-open-sans)', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
        sansation: ['var(--font-sansation)', 'sans-serif'],
        montez: ['var(--font-montez)', 'cursive'],
        jura: ['var(--font-jura)', 'sans-serif'],
        clash: ['var(--font-clash)', 'sans-serif'],
        chillax: ['var(--font-chillax)', 'sans-serif'],
        basis: ['var(--font-basis)', 'sans-serif'],
        moirai: ['var(--font-moirai)', 'serif'],
        fascinate: ['var(--font-fascinate)', 'cursive'],
      },
      colors: {
        primary: '#FDF9ED', // Example primary color
        secondary: '#F3FFB6', // Example secondary color
        accent: '#10B981', // Example accent color
        background: '#000000ff', // Example background color
        // background: '#141204', // Example background color

        foreground: '#F3F4F6', // Example foreground color
      },
  
      
    },
  },
  plugins: [],
}

