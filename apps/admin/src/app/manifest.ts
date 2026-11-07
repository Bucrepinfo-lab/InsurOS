import type { MetadataRoute } from 'next';

/** Web app manifest (served at /manifest.webmanifest) — installable PWA + TWA. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'InsurOS',
    short_name: 'InsurOS',
    description:
      'Operations workspace for insurers, agencies and their agents: customers, policies, claims and finance with role-based access.',
    start_url: '/?source=twa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f3ec',
    theme_color: '#1b2a41',
    lang: 'en-KE',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}
