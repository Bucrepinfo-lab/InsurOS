# Pricing, commission and referral — per country

**Written:** 18/11/26 · **Owner brief:** 18/11/26 · **Full plan (shareable):** https://claude.ai/artifact/JAQqxP79keTL3zZkVSieFW

Owner decision 18/11/26: nothing is global. Prices, commission and referral tokens are set **per country**, because caps, currency, levies and referral law differ. A country is switched off until its profile is verified against the law **and** approved by a named person. Code: `packages/domain/src/country-economics.ts` (tests: `country-economics.test.ts`).

## The law that shapes it (Kenya, verified against the Act and Regulations, IRA updated 2023)

- s.150: only licensed agents and brokers may act as intermediaries. Telpen Systems Ltd and every selling agent need an IRA licence.
- s.75 and draft Products Regulations: the **insurer** files the premium; an agency cannot set or cut it.
- Regulation 22, Eleventh Schedule: maximum commission per class (motor 10%, medical 10%, fire domestic 20%, fire industrial 25%, WIBA 20%, personal accident 20%, liability 20%, engineering 20%, marine cargo 17.5%, marine hull 10%, aviation 10%, theft 10%, micro-insurance 10%, miscellaneous 10%; ordinary life 50% / 20% / 5%; term 10%; group term 8%; deferred annuity 4% / 2%; single premium 2%).
- s.73: no rebate or inducement except in a published schedule of rates. So no commission given back as a discount, and no sale-linked reward to an unlicensed person.
- s.156: no cover before the insurer has the premium; commission paid within 30 days of the premium.
- s.203: claims paid within 90 days of being reported once documents are in; 5% penalty after.

## The plan

| Item | Rule |
|---|---|
| Price | Break-even target = expected claims / (1 − commission − running costs − margin), levies on top. Used to agree a filed scheme rate with insurers; never sell below it. Kenya example: KES 60,000 car premium → target KES 56,288 (3% margin), strict break-even KES 54,123. |
| Commission split | Agent 70% new / 60% renewal; Gold 75% / 65%; team leader 10%; agency the rest (20–30%, 15–25% for Gold). Agent never below 60% on new business. Never above the legal cap. Paid within 7 days of the insurer paying. Proportional clawback. Licensed people only. |
| Referral | Every person has a code (`KE-XXXXXX`). The code entered when a customer is added is permanent. Licensed referrers earn commission; the public earns a fixed token per **verified** sign-up (details confirmed), not tied to a sale, paid from marketing. Kenya proposed: KES 100, at most 20 a month. Self-referral and repeat phones earn nothing. |
| Speed | Policy within 24 h of a complete application with premium received; claim decision within 48 h of complete documents (`packages/domain/src/follow-up.ts`). |

## Country status

| Country | Status | Note |
|---|---|---|
| Kenya | Verified; figures **approved by the owner 18/11/26** | Split 70/60/10, token KES 100 (max 20 a month), Gold at KES 1,500,000 premium a quarter. **Selling waits for the company's IRA licence number** (s.150) |
| South Africa | Indicative | Regulation 5.3 (motor 12.5%, other 20%); current status to confirm |
| Uganda, Tanzania, Nigeria, Ghana, India, United Kingdom, United States | Not set | Off until a local adviser confirms caps and referral rules |

Approving a country = setting `approvedBy` and `approvedAt` on its profile in a reviewed commit (who and when, in git). Selling also needs `intermediaryLicence`: the licence number our company holds from that regulator.

## In the product

- Sales → **Commission plan** (`/dashboard/sales/commission-plan`): per country, cap and split per kind of policy, worked on any premium.
- Sales → **Break-even price** (`/dashboard/marketplace/break-even`): the calculator, with the country's levies.
- Sales → **Referrals** (`/dashboard/sales/referrals`): your code, your customers' codes, referrals this month and tokens due (figures only; finance pays).
- Add customer takes a referral code; confirming the customer's details on Follow-ups makes them Active and counts the referral.

Nothing here moves money: the insurer pays commission, finance pays agents and tokens.
