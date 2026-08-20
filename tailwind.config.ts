import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* === Terminal Hacker (phosphor + hazard) === */
        kanagawa: {
          bg: '#050505',          // near-pure black terminal
          surface: '#0A0F0A',     // one step, phosphor-tinted
          surface2: '#0F1A0F',    // two steps
          border: '#1F3A1F',      // dim phosphor for hairlines
          fg: '#00FF41',          // primary phosphor green
          fgMuted: '#33CC55',     // secondary phosphor
          fgDim: '#1F8A2F',       // dim phosphor (inactive)
          accent: '#FF0033',      // hazard red (severity / CTAs)
          accentSoft: '#FF3355',
          violet: '#FF0033',
          pink: '#FF3355',
          red: '#FF0033',
          peach: '#FF5577',
          orange: '#FF8800',
          yellow: '#FFD700',
          green: '#00FF41',
          aqua: '#00CCAA',
          teal: '#00AAAA',
          blue: '#0088CC',
        },
        severity: {
          critical: '#FF0033',    // hazard red — alarm
          high: '#FF8800',        // warning amber
          medium: '#FFD700',      // gold
          low: '#00CCAA',         // calm phosphor-aqua
          info: '#1F8A2F',        // dim phosphor
        },
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
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
