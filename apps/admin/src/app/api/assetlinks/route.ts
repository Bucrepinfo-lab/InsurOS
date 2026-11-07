import { NextResponse } from 'next/server';

/**
 * Served at /.well-known/assetlinks.json (rewrite in next.config.ts).
 * Digital Asset Links for the Android TWA (verifies the app owns this domain,
 * so it opens full-screen without a browser bar).
 *
 * Env (names only):
 *   ANDROID_CERT_FINGERPRINTS  comma-separated SHA-256 signing-cert fingerprints
 *                              (Play App Signing key AND upload key), AA:BB:… form
 *   ANDROID_PACKAGE_NAME       defaults to com.telpen.insuros
 * Fingerprints are public certificate hashes, not secrets.
 */
export const dynamic = 'force-dynamic';

const FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME?.trim() || 'com.telpen.insuros';
  const fingerprints = (process.env.ANDROID_CERT_FINGERPRINTS ?? '')
    .split(/[,\s]+/)
    .map((value) => value.trim().toUpperCase())
    .filter((value) => FINGERPRINT.test(value));

  const body =
    fingerprints.length === 0
      ? []
      : [
          {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'android_app',
              package_name: packageName,
              sha256_cert_fingerprints: Array.from(new Set(fingerprints))
            }
          }
        ];

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, max-age=300' }
  });
}
