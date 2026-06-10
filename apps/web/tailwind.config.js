/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-coinbase-display)'],
        sans: ['var(--font-coinbase-sans)'],
        mono: ['var(--font-coinbase-mono)'],
      },
      colors: {
        primary: {
          DEFAULT: '#0052ff',
          active: '#003ecc',
          disabled: '#a8b8cc',
        },
        ink: '#0a0b0d',
        body: '#5b616e',
        muted: {
          DEFAULT: '#7c828a',
          soft: '#a8acb3',
        },
        hairline: {
          DEFAULT: '#dee1e6',
          soft: '#eef0f3',
        },
        canvas: '#ffffff',
        surface: {
          soft: '#f7f7f7',
          card: '#ffffff',
          strong: '#eef0f3',
          dark: '#0a0b0d',
          darkElevated: '#16181c',
        },
        on: {
          primary: '#ffffff',
          dark: '#ffffff',
          darkSoft: '#a8acb3',
        },
        semantic: {
          up: '#05b169',
          down: '#cf202f',
        },
        accent: {
          yellow: '#f4b000',
        },
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '100px',
        full: '9999px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        base: '16px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '96px',
      },
    },
  },
  plugins: [],
};
