import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkEnabled } from './lib/clerk-enabled';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const passthrough = () => NextResponse.next();

export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : passthrough;

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};
