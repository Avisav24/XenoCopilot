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
        display: ['var(--font-sohne)', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['var(--font-sohne)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-sohne-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#533afd',
          deep: '#4434d4',
          press: '#2e2b8c',
          soft: '#665efd',
          bgSubduedHover: '#b9b9f9',
        },
        brand: {
          dark: '#1c1e54',
        },
        ink: {
          DEFAULT: '#0d253d',
          secondary: '#273951',
        },
        muted: {
          DEFAULT: '#64748d',
          soft: '#61718a',
        },
        hairline: {
          DEFAULT: '#e3e8ee',
          input: '#a8c3de',
        },
        canvas: {
          DEFAULT: '#ffffff',
          soft: '#f6f9fc',
          cream: '#f5e9d4',
        },
        surface: {
          soft: '#f6f9fc',
          card: '#ffffff',
          strong: '#e3e8ee',
          dark: '#1c1e54',
          darkElevated: '#0d253d',
        },
        on: {
          primary: '#ffffff',
          dark: '#ffffff',
          darkSoft: '#64748d',
        },
        semantic: {
          up: '#05b169',
          down: '#ea2261', // mapped from ruby
        },
        accent: {
          yellow: '#9b6829', // mapped from lemon
          pink: '#f96bee',   // mapped from magenta
        },
        shadow: {
          blue: '#003770',
        }
      },
      borderRadius: {
        none: '0px',
        xs: '8px',
        sm: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        pill: '8px',
        full: '9999px',
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        huge: '64px',
      },
      boxShadow: {
        card: '0 2px 5px -1px rgba(50, 50, 93, 0.25), 0 1px 3px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 13px 27px -5px rgba(50, 50, 93, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.3), 0 -6px 16px -6px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
