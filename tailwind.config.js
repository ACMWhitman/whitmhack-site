/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core system:
        //   Navy #010E30  — page background / dark surfaces
        //   White #FFFFFF — all text and copy
        //   Gold #FFC627  — the accent (Whitman Yellow)
        // Plus one more official brand hue used for card boxes:
        //   Whitman Blue #002868 (PMS 281) — the award/prize cards.
        // The legacy token names below are kept so existing markup doesn't
        // churn, but every token resolves to one of the colors above.
        'deep-space': '#010E30', // Navy — page background
        'silicon-blue': '#010E30', // Navy alias — dark panels/cards/timer cells
        'cyber-blue': '#010E30', // Navy alias — decorative dark accents
        // Official Whitman Blue (PMS 281) — award & prize card boxes.
        'whitman-blue': '#002868',
        // Accent alias — all accent/interactive highlights render in the
        // single gold hue (this token used to be a cyan/teal).
        'laser-teal': '#FFC627',
        // Gold (Whitman Yellow PMS 123) — the accent color.
        'electric-wheat': '#FFC627',
        // White — every piece of text.
        'walla-mist': '#FFFFFF',
      },
      fontFamily: {
        // Whitman's official headline face — Lora (elegant serif). Used for
        // headings, sub-headlines, eyebrows, day labels, and buttons.
        heading: ['Lora', 'Georgia', 'serif'],
        subhead: ['Lora', 'Georgia', 'serif'],
        // Body copy — Montserrat, the guide's accepted free substitute for
        // the paid Vito (the official geometric sans body face).
        body: ['Montserrat', 'Arial', 'Helvetica', 'sans-serif'],
        // Reserved for the decorative "falling code" accent only — not part
        // of the document's real typography.
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 20px 50px rgba(1, 14, 48, 0.45)',
        'glow-wheat': '0 20px 50px rgba(255, 198, 39, 0.3)',
        'glow-teal': '0 20px 50px rgba(255, 198, 39, 0.3)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
