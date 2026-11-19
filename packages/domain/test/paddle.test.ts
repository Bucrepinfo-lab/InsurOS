import { createHmac } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import {
  PLUS_PADDLE_PRICES,
  paddleConfig,
  paidItemFromPaddleEvent,
  verifyPaddleSignature,
} from '../src/paddle';

const hmac = (secret: string, data: string) => createHmac('sha256', secret).update(data).digest('hex');

const env = {
  PADDLE_ENABLED: 'true',
  PADDLE_CLIENT_TOKEN: 'test_client',
  PADDLE_WEBHOOK_SECRET: 'whsec',
  PADDLE_PRICE_PLUS_MONTH: 'pri_pm',
  PADDLE_PRICE_PLUS_YEAR: 'pri_py',
};

function event(priceId: string, overrides: Record<string, unknown> = {}) {
  return {
    event_type: 'transaction.completed',
    data: {
      id: 'txn_1',
      status: 'completed',
      custom_data: { plusReference: 'PLUS:cust_1:2026-11:Y' },
      items: [{ price: { id: priceId } }],
      currency_code: 'USD',
      details: { totals: { grand_total: '299' } },
      ...overrides,
    },
  };
}

describe('Paddle card checkout for My Cover Plus (owner 19/11/26)', () => {
  it('stays off unless enabled with every key set', () => {
    expect(paddleConfig({}, PLUS_PADDLE_PRICES)).toBeNull();
    expect(paddleConfig({ ...env, PADDLE_ENABLED: 'no' }, PLUS_PADDLE_PRICES)).toBeNull();
    expect(paddleConfig({ ...env, PADDLE_PRICE_PLUS_YEAR: '' }, PLUS_PADDLE_PRICES)).toBeNull();
    expect(paddleConfig(env, PLUS_PADDLE_PRICES)?.environment).toBe('sandbox');
    expect(paddleConfig({ ...env, PADDLE_ENV: 'production' }, PLUS_PADDLE_PRICES)?.environment).toBe('production');
  });

  it('accepts only a fresh, correctly signed notification', () => {
    const body = '{"a":1}';
    const now = 1_800_000_000_000;
    const ts = String(now / 1000);
    const h1 = hmac('whsec', `${ts}:${body}`);
    expect(verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, 'whsec', hmac, now)).toBe(true);
    expect(verifyPaddleSignature(`${body} `, `ts=${ts};h1=${h1}`, 'whsec', hmac, now)).toBe(false);
    expect(verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, 'other', hmac, now)).toBe(false);
    expect(verifyPaddleSignature(body, `ts=${ts};h1=${h1}`, 'whsec', hmac, now + 600_000)).toBe(false);
    expect(verifyPaddleSignature(body, null, 'whsec', hmac, now)).toBe(false);
  });

  it('the bought price decides the plan; the Plus reference comes from custom data', () => {
    const { prices } = paddleConfig(env, PLUS_PADDLE_PRICES)!;
    expect(paidItemFromPaddleEvent(event('pri_py'), prices, 'plusReference')).toEqual({
      transactionId: 'txn_1',
      key: 'YEAR',
      customId: 'PLUS:cust_1:2026-11:Y',
      amount: 2.99,
      currency: 'USD',
    });
  });

  it('ignores other events, other prices, unpaid or reference-less transactions', () => {
    const { prices } = paddleConfig(env, PLUS_PADDLE_PRICES)!;
    expect(paidItemFromPaddleEvent({ ...event('pri_pm'), event_type: 'transaction.created' }, prices, 'plusReference')).toBeNull();
    expect(paidItemFromPaddleEvent(event('pri_other'), prices, 'plusReference')).toBeNull();
    expect(paidItemFromPaddleEvent(event('pri_pm', { status: 'billed' }), prices, 'plusReference')).toBeNull();
    expect(paidItemFromPaddleEvent(event('pri_pm', { custom_data: null }), prices, 'plusReference')).toBeNull();
  });
});
