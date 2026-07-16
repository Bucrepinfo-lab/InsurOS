import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ClaimsAutomationService } from '@insuros/services';

const claimsAutomationService = new ClaimsAutomationService();

export default async function ClaimsAutomationPage() {
  const fnols = await claimsAutomationService.getFnols();
  const rules = await claimsAutomationService.getRules();
  const decisions = await claimsAutomationService.getDecisions();
  const stpRate = await claimsAutomationService.getStpRate();

  type DecisionRow = (typeof decisions)[number];
  type RuleRow = (typeof rules)[number];

  const decisionColumns: DataTableColumn<DecisionRow>[] = [
    { key: 'claimReference', header: 'Claim' },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (row) => (
        <Badge
          tone={
            row.outcome === 'AutoApproved'
              ? 'success'
              : row.outcome === 'ManualReview'
                ? 'warning'
                : 'danger'
          }
        >
          {row.outcome}
        </Badge>
      )
    },
    {
      key: 'fraudScore',
      header: 'Fraud Score',
      render: (row) => (
        <Badge
          tone={
            row.fraudScore >= 50
              ? 'danger'
              : row.fraudScore >= 25
                ? 'warning'
                : 'success'
          }
        >
          {String(row.fraudScore)}
        </Badge>
      )
    },
    {
      key: 'slaHours',
      header: 'Payout SLA',
      render: (row) => (row.slaHours ? `${row.slaHours}h` : '—')
    },
    {
      key: 'reasons',
      header: 'Reason',
      render: (row) => row.reasons.join(' ')
    },
    { key: 'decidedAt', header: 'Decided At' }
  ];

  const ruleColumns: DataTableColumn<RuleRow>[] = [
    { key: 'name', header: 'Rule' },
    { key: 'insuranceLine', header: 'Line' },
    {
      key: 'maxAutoApproveAmount',
      header: 'Max Amount',
      render: (row) => row.maxAutoApproveAmount.toLocaleString()
    },
    { key: 'maxFraudScore', header: 'Max Fraud Score' },
    {
      key: 'payoutSlaHours',
      header: 'Payout SLA',
      render: (row) => `${row.payoutSlaHours}h`
    },
    {
      key: 'active',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.active ? 'success' : 'neutral'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Claims Automation'
      description='Straight-through processing: FNOL intake, explainable fraud scoring, and rules-based auto-adjudication. Denials are never automated — a human always owns them.'
      actions={<Button>Submit FNOL</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='STP Rate'
          value={`${stpRate}%`}
          change='Claims decided without human touch'
        />
        <KPICard
          title='FNOL Submissions'
          value={String(fnols.length)}
          change='All channels (web, mobile, USSD, agent)'
        />
        <KPICard
          title='Auto-Approved'
          value={String(decisions.filter((item) => item.outcome === 'AutoApproved').length)}
          change='Paid within rule SLA'
        />
        <KPICard
          title='Fraud Flags'
          value={String(decisions.filter((item) => item.fraudScore >= 50).length)}
          change='High-risk, routed to review'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Adjudication Rules'
          description='Fast lanes by line: amount ceilings, fraud thresholds, payout SLAs.'
          searchPlaceholder='Search rules...'
          columns={ruleColumns}
          data={rules}
          emptyTitle='No rules'
          emptyDescription='No adjudication rules configured.'
          emptyAction={<Button>Create Rule</Button>}
        />
      </div>

      <DomainEntityList
        title='Decision Ledger'
        description='Every automated decision with its explainable reasons — audit-ready.'
        searchPlaceholder='Search decisions...'
        columns={decisionColumns}
        data={decisions}
        emptyTitle='No decisions'
        emptyDescription='No claims have been adjudicated.'
        emptyAction={<Button>Submit FNOL</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
