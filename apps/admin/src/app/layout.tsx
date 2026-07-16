import { ClerkProvider } from '@clerk/nextjs';
import { Fraunces, Onest, Spline_Sans_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { clerkEnabled } from '../lib/clerk-enabled';
import './globals.css';

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
  const app = (
    <html
      lang='en'
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{app}</ClerkProvider> : app;
}
