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
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-sohne-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          press: '#1D4ED8',
          soft: '#EFF6FF',
          bgSubduedHover: '#EFF6FF',
        },
        brand: {
          dark: '#111827',
        },
        ink: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
        },
        muted: {
          DEFAULT: '#9CA3AF',
          soft: '#E5E7EB',
        },
        hairline: {
          DEFAULT: '#E5E7EB',
          input: '#D1D5DB',
        },
        canvas: {
          DEFAULT: '#FAFAFA',
          soft: '#F9FAFB',
          cream: '#FAFAFA',
        },
        surface: {
          soft: '#F9FAFB',
          card: '#FFFFFF',
          strong: '#F3F4F6',
          dark: '#111827',
          darkElevated: '#1F2937',
        },
        on: {
          primary: '#FFFFFF',
          dark: '#FFFFFF',
          darkSoft: '#9CA3AF',
        },
        semantic: {
          up: '#10B981',
          down: '#EF4444', 
          warning: '#F59E0B'
        },
        accent: {
          yellow: '#F59E0B', 
          pink: '#2563EB', 
        },
        shadow: {
          blue: '#2563EB',
        }
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        pill: '9999px',
        full: '9999px',
      },
      boxShadow: {
        card: 'none',
        'card-hover': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
