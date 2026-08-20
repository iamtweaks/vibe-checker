import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* === Industrial Brutalism — Swiss Print substrate === */
        kanagawa: {
          bg: '#F4F4F0',          // matte off-white paper
          surface: '#EAE8E3',     // one step darker
          surface2: '#DCDAD3',    // two steps darker
          border: '#050505',     // ink
          fg: '#050505',          // ink
          fgMuted: '#2A2A2A',     // secondary ink
          fgDim: '#707070',       // tertiary
          accent: '#E61919',      // hazard red
          accentSoft: '#FF2A2A',
          violet: '#1A1A1A',
          pink: '#2A2A2A',
          red: '#E61919',
          peach: '#FF2A2A',
          orange: '#C41414',
          yellow: '#B8941A',
          green: '#2A8A1A',
          aqua: '#1A6A6A',
          teal: '#1A5A8A',
          blue: '#1A3A8A',
        },
        severity: {
          critical: '#E61919',
          high: '#FF2A2A',
          medium: '#B8941A',
          low: '#1A5A8A',
          info: '#707070',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        // All radii → 0 for mechanical rigidity
        none: '0',
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
    },
  },
  plugins: [],
}

export default config