import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { Fact, NotYet, Rows, Section } from '@/components/record-view';
import { loadClaim, money, shortDate } from '@/lib/records';

export const metadata = { title: 'Settlement' };

export default async function ClaimSettlementPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, policy, story, tabs } = await loadClaim(claimId);
  const description =
    'Reserve, approved amount, discharge, payment and the certificate of settlement, as recorded by your claims and finance teams. InsurOS keeps the record; it does not send the money.';

  if (!story) {
    return (
      <DomainModulePage title={`Settlement · ${claim.claimNumber}`} description={description}>
        <Tabs items={tabs} activeId='settlement'>
          <Section title='Not settled yet'>
            <NotYet>
              This claim ({claim.status.toLowerCase()}) has no settlement recorded. A claim is settled after it is
              approved, the claimant signs the discharge voucher, finance records the payment and the claims manager
              approves the certificate of settlement.
            </NotYet>
          </Section>
        </Tabs>
      </DomainModulePage>
    );
  }

  const s = story.settlement;
  const deductions: [string, string][] = [['Amount claimed', money(s.claimed)]];
  if (s.excess > 0) deductions.push(['Less excess', `− ${money(s.excess)}`]);
  if (s.notCovered > 0) deductions.push([`Less not covered (${s.notCoveredReason})`, `− ${money(s.notCovered)}`]);
  deductions.push(['Amount paid', money(s.approved)]);

  return (
    <DomainModulePage title={`Settlement · ${claim.claimNumber}`} description={description}>
      <Tabs items={tabs} activeId='settlement'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Fact label='Reserve'>{money(s.reserve)}</Fact>
          <Fact label='Approved'>{money(s.approved)}</Fact>
          <Fact label='Paid on'>{shortDate(s.paidOn)}</Fact>
          <Fact label='Certificate'>
            <Badge tone='success'>Approved</Badge>
          </Fact>
        </div>
        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='How the amount was worked out'>
            <Rows rows={deductions} />
          </Section>
          <Section title='Payment'>
            <Rows
              rows={[
                ['Paid to', s.paidTo],
                ['How', s.method],
                ['Reference', s.paymentReference],
                ['Discharge voucher signed', shortDate(s.dischargeSignedOn)]
              ]}
            />
          </Section>
        </div>
        <div className='mt-6'>
          <section
            aria-label='Certificate of settlement'
            className='rounded-2xl border-2 border-seal/40 bg-sheet p-6 shadow-sm'
          >
            <p className='text-xs font-semibold uppercase tracking-wider text-seal'>Certificate of settlement</p>
            <h2 className='mt-1 font-display text-2xl text-ink'>{s.certificateNumber}</h2>
            <p className='mt-3 text-sm text-ink'>
              Claim {claim.claimNumber} under policy {claim.policyNumber}
              {policy ? ` (${policy.product})` : ''}, made by {claim.customer}, is settled. <strong>{money(s.approved)}</strong> was
              paid to {s.paidTo} on {shortDate(s.paidOn)} in full and final settlement of the claim.
            </p>
            <div className='mt-4'>
              <Rows
                rows={[
                  ['Approved by', s.certificateApprovedBy],
                  ['Approved on', shortDate(s.certificateApprovedOn)],
                  ['Claim status', 'Settled']
                ]}
              />
            </div>
          </section>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
