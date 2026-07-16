import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { clerkEnabled } from '../lib/clerk-enabled';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const app = (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{app}</ClerkProvider> : app;
}
