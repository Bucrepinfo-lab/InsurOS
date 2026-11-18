import { createHash, randomBytes } from 'node:crypto';
import { SITE_URL } from './site';

/**
 * A customer's private link to their conversation. The token is 24 random
 * bytes; only its SHA-256 is stored, so a database leak does not leak links.
 * Whoever holds the link can read and write that one conversation, nothing else.
 */
export function newCustomerLink(): { token: string; hash: string; url: string } {
  const token = randomBytes(24).toString('base64url');
  return { token, hash: hashCustomerToken(token), url: customerLinkUrl(token) };
}

export function hashCustomerToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isCustomerToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{32}$/.test(token);
}

export function customerLinkUrl(token: string): string {
  return `${SITE_URL}/c/${token}`;
}

/** A customer's own home page: their policies and cover. Same kind of token, different page. */
export function customerHomeUrl(token: string): string {
  return `${SITE_URL}/my/${token}`;
}
