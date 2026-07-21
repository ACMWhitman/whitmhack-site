/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-space': '#010C24',
        'silicon-blue': '#0A193F',
        // Deepened/desaturated from the original neon versions (#004BFF,
        // #00F5FF) — same hue family so the brand still reads, but richer
        // and quieter instead of full-saturation "arcade" tones. Both
        // still clear WCAG AA (4.5:1) as small text against deep-space.
        'cyber-blue': '#2C4C96',
        'laser-teal': '#2C8D96',
        // Warmed slightly from the original #FFC627 — a touch more
        // antique-gold, less lemon-yellow.
        'electric-wheat': '#E2A936',
        'walla-mist': '#EFF2F9',
        // Muted neutrals — for secondary/inactive content that shouldn't
        // compete with the three accent colors above.
        parchment: '#C7BA97',
        'slate-mist': '#7A84A3',
      },
      fontFamily: {
        // Headlines: heavy, high-contrast old-style serif (newspaper masthead feel).
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        // Sub-headlines, eyebrows/kickers, author lines, labels, and buttons.
        subhead: ['"Libre Franklin"', '"Franklin Gothic Medium"', 'Arial', 'Helvetica', 'sans-serif'],
        // Body copy — Georgia over Times New Roman for its wider, more legible spacing.
        body: ['Georgia', '"Times New Roman"', 'serif'],
        // Reserved for the decorative "falling code" accent only — not part
        // of the document's real typography.
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 20px 50px rgba(44, 76, 150, 0.35)',
        'glow-wheat': '0 20px 50px rgba(226, 169, 54, 0.35)',
        'glow-teal': '0 20px 50px rgba(44, 141, 150, 0.35)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'text-flow': {
          '0%': { 'background-position': '0% center' },
          '100%': { 'background-position': '200% center' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        // The edge-light ring reuses Tailwind's built-in `spin` keyframe
        // (just a plain 360deg rotation) at a slower, calmer 4s pace.
        'border-spin': 'spin 4s linear infinite',
        'text-flow': 'text-flow 3s linear infinite',
      },
    },
  },
  plugins: [],
}
