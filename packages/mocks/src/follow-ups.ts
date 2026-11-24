import { followUpId, type FollowUp } from '@insuros/domain';

/**
 * Worked examples for Follow-ups and Escalations in the DEMO tenant only
 * (owner 24/11/26: three examples on every page, for testing the flow).
 *
 * Owned by the store reviewer ("play-review", the reviewer's session id), so a
 * tester signed in as the reviewer sees them in Follow-ups and can confirm
 * them. Opened in the past on purpose: each one is overdue and shows on the
 * Escalations page, one per area (claim, policy, customer), on records that
 * exist in the demo book (sample-book.ts).
 */
const REVIEWER = { ownerUserId: 'play-review', ownerName: 'Store reviewer (demo data)' };

const item = (
  area: FollowUp['area'],
  reference: string,
  stepId: string,
  subject: string,
  openedAt: string
): FollowUp => ({ id: followUpId(area, reference, stepId), area, reference, stepId, subject, openedAt, ...REVIEWER });

export const mockFollowUps: FollowUp[] = [
  item('claims', 'CLM-2026-0001', 'review', 'Demo Customer: claim review', '2026-11-20T06:00:00.000Z'),
  item('policies', 'POL-2026-0001', 'underwrite', 'Demo Customer: underwriting decision', '2026-11-21T07:30:00.000Z'),
  item('customers', 'sample-amina-hassan', 'confirm', 'Amina Hassan: confirm details', '2026-11-22T05:15:00.000Z')
];
