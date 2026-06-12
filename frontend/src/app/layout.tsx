import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'XenoCopilot | Revenue Intelligence',
  description: 'AI-Native Customer Intelligence Command Center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-ink bg-canvas min-h-screen selection:bg-primary/20 selection:text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
