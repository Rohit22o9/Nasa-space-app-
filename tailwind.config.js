/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#070d1d',
          850: '#0c152c',
          800: '#111e3b',
          700: '#1b2d56',
          600: '#263e75',
        },
        nasa: {
          blue: '#0B3D91',
          red: '#FC3D21',
          cyan: '#00e5ff',
          gold: '#f59e0b',
          emerald: '#10b981',
          dark: '#050914'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 229, 255, 0.4)',
        'glow-blue': '0 0 20px -3px rgba(11, 61, 145, 0.5)',
        'glow-red': '0 0 15px -3px rgba(252, 61, 33, 0.4)',
        'glow-gold': '0 0 15px -3px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'scanline': 'scanline 6s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
