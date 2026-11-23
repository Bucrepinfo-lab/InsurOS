import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { Fact, NotYet, RecordLink, Rows, Section } from '@/components/record-view';
import { loadClaim, money, shortDate } from '@/lib/records';

export const metadata = { title: 'Settlement' };

export default async function ClaimSettlementPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, policy, settlement: s, tabs } = await loadClaim(claimId);
  const description =
    'Approved amount, discharge, payment and the certificate of settlement, as recorded by your claims and finance teams. InsurOS keeps the record; it does not send the money.';
  const overview = `/dashboard/claims/${encodeURIComponent(claim.id)}`;

  if (!s) {
    return (
      <DomainModulePage title={`Settlement · ${claim.claimNumber}`} description={description}>
        <Tabs items={tabs} activeId='settlement'>
          <Section title={claim.status === 'Closed' ? 'Declined' : 'Not decided yet'}>
            <NotYet>
              {claim.declinedReason
                ? `This claim was declined: ${claim.declinedReason}`
                : `This claim is ${claim.status.toLowerCase()}. It is settled after it is approved, the claimant signs the discharge voucher, the payment is recorded and the claims manager approves the certificate of settlement.`}{' '}
              <RecordLink href={overview}>Go to the next step</RecordLink>
            </NotYet>
          </Section>
        </Tabs>
      </DomainModulePage>
    );
  }

  const paid = Boolean(s.paymentReference);
  const certified = Boolean(s.certificateNumber);
  const deductions: [string, string][] = [['Amount claimed', money(s.claimed)]];
  if (s.excess > 0) deductions.push(['Less excess', `− ${money(s.excess)}`]);
  if (s.notCovered > 0) deductions.push([`Less not covered (${s.notCoveredReason ?? 'outside the cover'})`, `− ${money(s.notCovered)}`]);
  deductions.push(['Amount approved', money(s.approved)]);

  return (
    <DomainModulePage title={`Settlement · ${claim.claimNumber}`} description={description}>
      <Tabs items={tabs} activeId='settlement'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Fact label='Approved'>{money(s.approved)}</Fact>
          <Fact label='Approved by'>{s.approvedBy ? `${s.approvedBy}${s.approvedOn ? `, ${shortDate(s.approvedOn)}` : ''}` : '—'}</Fact>
          <Fact label='Paid on'>{paid ? shortDate(s.paidOn) : 'Not recorded yet'}</Fact>
          <Fact label='Certificate'>
            <Badge tone={certified ? 'success' : 'warning'}>{certified ? 'Approved' : 'Waiting'}</Badge>
          </Fact>
        </div>
        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='How the amount was worked out'>
            <Rows rows={deductions} />
          </Section>
          <Section title='Payment'>
            {paid ? (
              <Rows
                rows={[
                  ['Paid to', s.paidTo ?? '—'],
                  ['How', s.method ?? '—'],
                  ['Reference', s.paymentReference ?? '—'],
                  ['Discharge voucher signed', shortDate(s.dischargeSignedOn)],
                  ['Recorded by', s.paymentRecordedBy ?? '—']
                ]}
              />
            ) : (
              <NotYet>
                Not recorded yet. Finance pays outside InsurOS; then someone other than the approver records the payment on the{' '}
                <RecordLink href={overview}>claim overview</RecordLink>.
              </NotYet>
            )}
          </Section>
        </div>
        <div className='mt-6'>
          {certified ? (
            <section aria-label='Certificate of settlement' className='rounded-2xl border-2 border-seal/40 bg-sheet p-6 shadow-sm'>
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
                    ['Approved by', s.certificateApprovedBy ?? '—'],
                    ['Approved on', shortDate(s.certificateApprovedOn)],
                    ['Claim status', claim.status]
                  ]}
                />
              </div>
            </section>
          ) : (
            <Section title='Certificate of settlement'>
              <NotYet>
                {paid
                  ? 'Waiting for the claims manager to approve it on the claim overview.'
                  : 'Issued once the payment is recorded and the claims manager approves it.'}
              </NotYet>
            </Section>
          )}
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
