import { describe, expect, it } from 'vitest';

import { MPESA_COUNTRIES, PADDLE_BLOCKED_COUNTRIES, localMethodFor, paddleSellsIn, subscriptionRail, subscriptionRails } from '../src/payment-rails';

describe('payment rails by country (owner rules 19/11/26)', () => {
  it('Kenya: M-Pesa leads, Paddle second for card payers', () => {
    expect(subscriptionRails({ country: 'KE', paddleOn: true })).toEqual(['MPESA', 'PADDLE']);
    expect(subscriptionRail({ country: 'KE', paddleOn: true })).toBe('MPESA');
    expect(subscriptionRails({ country: 'KE', paddleOn: false })).toEqual(['MPESA']);
  });

  it('Paddle leads where no local method can be charged', () => {
    expect(subscriptionRails({ country: 'ng', paddleOn: true })).toEqual(['PADDLE']);
    expect(subscriptionRail({ country: 'US', paddleOn: true })).toBe('PADDLE');
  });

  it('no way to pay yet where Paddle is blocked and no local method is available', () => {
    expect(subscriptionRail({ country: 'SO', paddleOn: true })).toBe('NONE');
    expect(subscriptionRail({ country: 'UG', paddleOn: false })).toBe('NONE');
    expect(subscriptionRails({ country: '', paddleOn: true })).toEqual([]);
  });

  it('carries Paddle\'s blocked list, African countries included', () => {
    for (const code of ['CF', 'CD', 'LY', 'ML', 'SO', 'SS', 'SD', 'ZW']) {
      expect(PADDLE_BLOCKED_COUNTRIES.has(code)).toBe(true);
      expect(paddleSellsIn(code)).toBe(false);
    }
    expect(paddleSellsIn('KE')).toBe(true);
    expect(paddleSellsIn(null)).toBe(false);
  });
});

const allOn = { pawapay: true, paystack: true, paddle: true };

describe('the way most people pay leads; the card comes later (owner standing order 19/11/26)', () => {
  it('Kenya: M-Pesa first, Paddle card second', () => {
    expect(subscriptionRails({ country: 'KE', switches: allOn })).toEqual(['MPESA', 'PADDLE']);
    expect(MPESA_COUNTRIES.has('KE')).toBe(true);
  });

  it('mobile money countries: mobile money first, card second', () => {
    expect(subscriptionRails({ country: 'ug', switches: allOn })).toEqual(['MOBILE_MONEY', 'PADDLE']);
    expect(subscriptionRails({ country: 'GH', switches: allOn })).toEqual(['MOBILE_MONEY', 'PADDLE']);
    expect(localMethodFor('CI')?.currency).toBe('XOF');
  });

  it('Nigeria and South Africa: bank transfer / EFT first, card second', () => {
    expect(subscriptionRails({ country: 'NG', switches: allOn })).toEqual(['BANK_TRANSFER', 'PADDLE']);
    expect(subscriptionRails({ country: 'ZA', switches: allOn })).toEqual(['BANK_TRANSFER', 'PADDLE']);
  });

  it('a local way opens only when its provider is on and its price is approved', () => {
    expect(subscriptionRails({ country: 'UG', switches: { ...allOn, pawapay: false } })).toEqual(['PADDLE']);
    expect(subscriptionRails({ country: 'UG', switches: allOn, localPriceApproved: false })).toEqual(['PADDLE']);
  });

  it('nothing where Paddle is blocked and no local way is open', () => {
    expect(subscriptionRail({ country: 'SO', switches: allOn })).toBe('NONE');
  });
});
