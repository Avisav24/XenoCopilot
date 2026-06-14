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
        display: ['var(--font-display)', 'Times New Roman', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#292524',
          active: '#0c0a09',
        },
        ink: {
          DEFAULT: '#0c0a09',
          muted: '#777169',
          soft: '#a8a29e',
        },
        body: {
          DEFAULT: '#4e4e4e',
          strong: '#292524',
        },
        on: {
          primary: '#ffffff',
          dark: '#ffffff',
          'dark-soft': '#a8a29e',
        },
        canvas: {
          DEFAULT: '#f5f5f5',
          soft: '#fafafa',
          deep: '#0c0a09',
        },
        surface: {
          card: '#ffffff',
          strong: '#f0efed',
          dark: '#0c0a09',
          'dark-elevated': '#1c1917',
        },
        hairline: {
          DEFAULT: '#e7e5e4',
          soft: '#f0efed',
          strong: '#d6d3d1',
        },
        semantic: {
          success: '#16a34a',
          error: '#dc2626',
        },
        gradient: {
          mint: '#a7e5d3',
          peach: '#f4c5a8',
          lavender: '#c8b8e0',
          sky: '#a8c8e8',
          rose: '#e8b8c4',
        }
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '24px',
        pill: '9999px',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
