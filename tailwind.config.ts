import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kanagawa: {
          bg: '#1F1F28',
          surface: '#2A2A37',
          surface2: '#363646',
          border: '#54546D',
          fg: '#DCD7BA',
          fgMuted: '#C8C093',
          fgDim: '#727169',
          accent: '#7E9CD8',
          accentSoft: '#9CABCA',
          violet: '#957FB8',
          pink: '#D27E99',
          red: '#E82424',
          peach: '#FF5D62',
          orange: '#FFA066',
          yellow: '#FF9E3B',
          green: '#98BB6C',
          aqua: '#7AA89F',
          teal: '#7FB4CA',
          blue: '#658594',
        },
        severity: {
          critical: '#E82424',
          high: '#FF5D62',
          medium: '#FF9E3B',
          low: '#7FB4CA',
          info: '#727169',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config