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
          DEFAULT: '#171717',
          muted: '#737373',
          light: '#A3A3A3',
        },
        hairline: {
          DEFAULT: '#E5E7EB',
          dark: '#D4D4D8',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFAFA',
          subtle: '#F4F4F5',
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
