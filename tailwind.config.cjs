/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#30363d',
        input: '#21262d',
        ring: '#58a6ff',
        background: '#0d1117',
        foreground: '#c9d1d9',
        primary: {
          DEFAULT: '#58a6ff',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#21262d',
          foreground: '#c9d1d9',
        },
        destructive: {
          DEFAULT: '#f85149',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#161b22',
          foreground: '#8b949e',
        },
        accent: {
          DEFAULT: '#21262d',
          foreground: '#c9d1d9',
        },
        popover: {
          DEFAULT: '#161b22',
          foreground: '#c9d1d9',
        },
        card: {
          DEFAULT: '#161b22',
          foreground: '#c9d1d9',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
