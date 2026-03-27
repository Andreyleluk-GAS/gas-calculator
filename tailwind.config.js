/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Brand Colors ────────────────────────────────────────────────
      colors: {
        // Primary – Digital Blue
        primary: {
          50:  '#e6f0ff',
          100: '#bdd5ff',
          200: '#91b9ff',
          300: '#619eff',
          400: '#3a86ff',
          500: '#0063CC', // main
          600: '#0055b3',
          700: '#00439a',
          800: '#003280',
          900: '#001f57',
          DEFAULT: '#0063CC',
        },
        // Secondary – Savings Green
        secondary: {
          50:  '#e0faf0',
          100: '#b3f2d5',
          200: '#7eeab9',
          300: '#47e19c',
          400: '#1fd985',
          500: '#00C883', // main
          600: '#00b073',
          700: '#009561',
          800: '#007a4f',
          900: '#00512f',
          DEFAULT: '#00C883',
        },
        // Dark / Graphite
        graphite: {
          50:  '#f2f2f5',
          100: '#d9d9e3',
          200: '#b3b3c7',
          300: '#8c8cab',
          400: '#666680',
          500: '#3f3f5a',
          600: '#2d2d45',
          700: '#252538',
          800: '#1F1F31', // main
          900: '#14141f',
          DEFAULT: '#1F1F31',
        },
        // Error / Danger
        danger: {
          light: '#FD2F2F',
          DEFAULT: '#FD2F2F',
          dark:  '#C32121',
        },
        // Utility / Muted
        utility: {
          DEFAULT: '#D5D9FF',
          muted: '#8B8FA8',
        },
        // Neutral surface
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#FAFBFF',
          100: '#F4F5FB',
          200: '#EAECF5',
          300: '#D0D5E8',
        },
      },

      // ─── Typography ──────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg':  ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1':          ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'h2':          ['1.875rem',{ lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '700' }],
        'h3':          ['1.5rem',  { lineHeight: '1.3',  letterSpacing: '-0.008em', fontWeight: '600' }],
        'h4':          ['1.25rem', { lineHeight: '1.4',  letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-lg':     ['1.125rem',{ lineHeight: '1.7',  fontWeight: '400' }],
        'body':        ['1rem',    { lineHeight: '1.6',  fontWeight: '400' }],
        'body-sm':     ['0.875rem',{ lineHeight: '1.6',  fontWeight: '400' }],
        'caption':     ['0.75rem', { lineHeight: '1.5',  fontWeight: '400' }],
        'label':       ['0.875rem',{ lineHeight: '1.4',  fontWeight: '500' }],
        'overline':    ['0.75rem', { lineHeight: '1.5',  letterSpacing: '0.08em', fontWeight: '600' }],
      },
      fontWeight: {
        regular:   '400',
        medium:    '500',
        semibold:  '600',
        bold:      '700',
        extrabold: '800',
      },

      // ─── Border Radius ───────────────────────────────────────────────
      borderRadius: {
        'none': '0',
        'xs':   '4px',
        'sm':   '6px',
        DEFAULT:'8px',
        'md':   '10px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
        'full': '9999px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(31 31 49 / 0.06)',
        'sm':    '0 1px 3px 0 rgb(31 31 49 / 0.10), 0 1px 2px -1px rgb(31 31 49 / 0.06)',
        DEFAULT: '0 4px 6px -1px rgb(31 31 49 / 0.10), 0 2px 4px -2px rgb(31 31 49 / 0.06)',
        'md':    '0 4px 16px -2px rgb(0 99 204 / 0.12), 0 2px 8px -2px rgb(31 31 49 / 0.08)',
        'lg':    '0 10px 32px -4px rgb(0 99 204 / 0.16), 0 4px 16px -4px rgb(31 31 49 / 0.10)',
        'xl':    '0 20px 48px -8px rgb(0 99 204 / 0.20), 0 8px 24px -4px rgb(31 31 49 / 0.12)',
        '2xl':   '0 32px 64px -12px rgb(0 99 204 / 0.25)',
        'glow-primary':   '0 0 20px rgb(0 99 204 / 0.35)',
        'glow-secondary': '0 0 20px rgb(0 200 131 / 0.35)',
        'inner':  'inset 0 2px 4px 0 rgb(31 31 49 / 0.06)',
        'none':   'none',
      },

      // ─── Transitions ─────────────────────────────────────────────────
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },

      // ─── Spacing / Layout extras ─────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },
    },
  },
  plugins: [],
}