import type { Metadata } from 'next';
import { Fraunces, Onest, Spline_Sans_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "InsurOS — The Underwriter's Ledger",
    template: '%s · InsurOS'
  },
  description:
    'Multi-continental insurance operations: claims in hours, engineered fair prices, cover from 20 bob a day.'
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
      <body>{children}</body>
    </html>
  );
}
