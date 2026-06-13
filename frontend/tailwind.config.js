/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          soft: '#EFF6FF',
          press: '#1D4ED8',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
        hairline: {
          DEFAULT: '#E2E8F0',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
        },
        semantic: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
