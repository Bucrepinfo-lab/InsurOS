import type { Metadata, Viewport } from 'next';
import { Fraunces, Onest, Spline_Sans_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/service-worker-register';

export const metadata: Metadata = {
  title: {
    default: "InsurOS — The Underwriter's Ledger",
    template: '%s · InsurOS'
  },
  description:
    'Operations workspace for insurers, agencies and their agents: customers, policies, claims and finance.',
  applicationName: 'InsurOS',
  appleWebApp: { capable: true, title: 'InsurOS', statusBarStyle: 'default' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#1b2a41',
  width: 'device-width',
  initialScale: 1
};

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces'
});

const body = Onest({
  subsets: ['latin'],
  variable: '--font-onest'
});

const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-spline-mono'
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
