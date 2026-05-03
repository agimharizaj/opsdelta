/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0E0E0E',
          soft: '#1C1C1C',
          mute: '#5A5650',
          faint: '#8B867D',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          warm: '#F2EDE5',
          card: '#FFFFFF',
          line: '#E5DFD3',
        },
        ember: {
          DEFAULT: '#D9472A',
          deep: '#B53A20',
          soft: '#FBE9E2',
          tint: '#F7D9CD',
        },
        moss: {
          DEFAULT: '#3F5E4A',
          soft: '#E4ECE5',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(14,14,14,0.04), 0 8px 24px -12px rgba(14,14,14,0.12)',
        soft: '0 0 0 1px rgba(14,14,14,0.06), 0 24px 48px -24px rgba(14,14,14,0.18)',
      },
    },
  },
  plugins: [],
};
