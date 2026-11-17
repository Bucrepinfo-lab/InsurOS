/** The public address of this deployment (used for share links). Not a secret. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://getinsuros.com').replace(/\/+$/, '');
