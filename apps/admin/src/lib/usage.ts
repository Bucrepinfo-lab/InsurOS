import type { UsageKind } from '@insuros/domain';

/**
 * Tell the server that something was opened, looked for or clicked. It never
 * waits and never throws: the page must not slow down or break for a count.
 */
export function track(kind: UsageKind, value: string): void {
  try {
    const body = JSON.stringify({ kind, value });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon('/api/usage', new Blob([body], { type: 'application/json' }))) return;
    }
    void fetch('/api/usage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => undefined);
  } catch {
    // Counting is best effort.
  }
}
