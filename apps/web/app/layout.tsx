import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';

const sohne = localFont({
  src: [
    {
      path: '../public/fonts/sohne/Sohne-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/sohne/Sohne-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/sohne/Sohne-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/sohne/Sohne-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sohne',
});

const sohneMono = localFont({
  src: [
    {
      path: '../public/fonts/sohne/SohneMono-Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-sohne-mono',
});

export const metadata: Metadata = {
  title: 'XenoCopilot | Revenue Intelligence',
  description: 'AI-Native Customer Intelligence Command Center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sohne.variable} ${sohneMono.variable}`}>
      <body className="font-sans antialiased text-ink bg-canvas-soft min-h-screen selection:bg-primary/20 selection:text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
