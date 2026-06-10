import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';

const interDisplay = Inter({ subsets: ['latin'], variable: '--font-coinbase-display', display: 'swap' });
const interSans = Inter({ subsets: ['latin'], variable: '--font-coinbase-sans', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-coinbase-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'XenoCopilot — AI CRM Campaign Platform',
  description: 'AI-powered mini CRM for intelligent campaign management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interDisplay.variable} ${interSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-surface-soft text-ink">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-canvas relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
