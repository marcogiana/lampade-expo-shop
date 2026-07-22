/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141318',        // sfondo antracite caldo
        surface: '#1D1B21',    // superfici / card
        surface2: '#26232B',   // hover / bordi
        paper: '#F3EFE7',      // testo primario chiaro caldo
        muted: '#948E92',      // testo secondario
        brass: '#C6A05C',      // accento ottone
        'brass-bright': '#E4C07E',
        ember: '#D8552E',      // accento sconto / CTA
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px 6px rgba(198, 160, 92, 0.18)',
      },
    },
  },
  plugins: [],
};
