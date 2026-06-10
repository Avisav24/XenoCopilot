import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'XenoCopilot — AI CRM Campaign Platform',
  description: 'AI-powered mini CRM for intelligent campaign management, audience segmentation, and real-time delivery analytics for Drape & Co.',
  keywords: 'CRM, campaign management, AI segmentation, email marketing, WhatsApp campaigns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-slate-50">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
