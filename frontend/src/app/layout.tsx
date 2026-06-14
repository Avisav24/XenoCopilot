import type { Metadata } from 'next';
import { Inter, EB_Garamond } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'], // The system requested 300, but EB Garamond 400 is the closest standard regular available in standard google fonts if 300 isn't reliable. However, next/font usually supports variable or specific. I'll use '400' but actually EB Garamond has '400' to '800'. I'll stick with default weights. Let's just use 400 which is regular. Wait, Google fonts has 400-800 for EB Garamond. I'll just use weight 400 as the substitute for 300.
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'XenoCopilot | Revenue Intelligence',
  description: 'AI-Native Customer Intelligence Command Center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ebGaramond.variable}`}>
      <body className="font-sans antialiased text-ink bg-canvas min-h-screen selection:bg-primary/20 selection:text-on-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
