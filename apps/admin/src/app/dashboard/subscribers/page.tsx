import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  MarketingBanner,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { addDemoSubscriber } from '@/app/dashboard/actions';
import {
  EngagementService,
  MicroinsuranceService,
  PricingService,
  SubscriptionService,
  computePolicyHealth
} from '@insuros/services';

const subscriptionService = new SubscriptionService();
const engagementService = new EngagementService();
const microinsuranceService = new MicroinsuranceService();
const pricingService = new PricingService();

export default async function SubscriberExperiencePage() {
  const plans = await subscriptionService.getPlans();
  const subscriptions = await subscriptionService.getSubscriptions();
  const alerts = await subscriptionService.getAlerts();
  const feed = await engagementService.getFeed('KE');
  const newsletter = await engagementService.getNewsletterThread('cover-letter');
  const policies = await microinsuranceService.getPolicies();

  // Competitive comparison banner: our engineered price vs market median.
  const quote = await pricingService.quote({
    insuranceLine: 'Motor',
    countryCode: 'KE',
    baseMonthlyPremium: 3_000,
    riskFactorIds: ['risk-urban', 'risk-telematics-good'],
    affordabilityBandId: 'band-standard',
    expenseLoadingPercent: 12,
    commissionLoadingPercent: 8
  });

  // Sample subscriber (Samuel): policy health from his real records.
  const samuel = subscriptions[0];
  const samuelPolicies = policies.filter(
    (policy) => policy.msisdn === samuel?.msisdn
  );
  const health = computePolicyHealth(
    samuelPolicies.filter((policy) => policy.status === 'Active').length,
    samuelPolicies.filter((policy) => policy.status === 'Lapsed').length,
    true,
    true
  );

  type SubscriptionRow = (typeof subscriptions)[number];
  type FeedRow = (typeof feed)[number];
  type IssueRow = (typeof newsletter)[number];

  const subscriptionColumns: DataTableColumn<SubscriptionRow>[] = [
    { key: 'subscriberName', header: 'Subscriber' },
    { key: 'msisdn', header: 'Mobile' },
    {
      key: 'planId',
      header: 'Plan',
      render: (row) => {
        const plan = plans.find((item) => item.id === row.planId);
        return plan
          ? `${plan.currency} ${plan.monthlyPrice}/mo · 1st month free`
          : row.planId;
      }
    },
    { key: 'referralCode', header: 'Referral Code' },
    { key: 'renewalDueAt', header: 'Renews (day 40)' },
    {
      key: 'alerts',
      header: 'Nudges',
      render: (row) =>
        alerts
          .filter((alert) => alert.subscriptionId === row.id)
          .map((alert) => `${alert.kind === 'Day35' ? 'D35' : 'D39'}:${alert.status}`)
          .join(' · ') || '—'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Trial'
                ? 'neutral'
                : row.status === 'PastDue'
                  ? 'warning'
                  : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  const feedColumns: DataTableColumn<FeedRow>[] = [
    {
      key: 'kind',
      header: 'Type',
      render: (row) => <Badge tone='neutral'>{row.kind}</Badge>
    },
    { key: 'title', header: 'Content' },
    {
      key: 'shareable',
      header: 'Word-of-Mouth',
      render: (row) =>
        row.shareable ? (
          <Badge tone='success'>Share-ready</Badge>
        ) : (
          '—'
        )
    },
    {
      key: 'shareText',
      header: 'Forward Text',
      render: (row) => row.shareText ?? '—'
    },
    { key: 'publishedAt', header: 'Published' }
  ];

  const issueColumns: DataTableColumn<IssueRow>[] = [
    {
      key: 'issueNumber',
      header: '#',
      render: (row) => `#${row.issueNumber}`
    },
    { key: 'threadName', header: 'Thread' },
    { key: 'subject', header: 'Subject' },
    { key: 'preview', header: 'Preview' },
    { key: 'publishedAt', header: 'Published' }
  ];

  const savings = quote.competitorMedian
    ? Math.round(quote.competitorMedian - quote.recommendedPremium)
    : 0;

  return (
    <DomainModulePage
      title='Subscriber Experience'
      description='The customer-side experience, previewed: 10 units/month (first month free, day-40 renewal, day-35 & 39 nudges), policy health, engagement feed with share-ready content, newsletter threads, and merit-comparison banners.'
      actions={<ActionButton label='New subscriber' action={addDemoSubscriber} />}
    >
      <MarketingBanner
        headline={`Same cover. KES ${savings.toLocaleString()} less every month than the market median.`}
        body={`Our engineered motor premium: KES ${quote.recommendedPremium.toLocaleString()}/mo vs the market median KES ${(quote.competitorMedian ?? 0).toLocaleString()}. No branches, no paper, no padding — and claims paid in hours with the reason attached. The app costs 10 bob a month, first month free, and you can leave any time. Tell a friend: you both earn a free month.`}
        cta='Compare us yourself'
        ctaHref='/dashboard/marketplace/pricing-engine'
      />

      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Subscription'
          value='10 / month'
          change='Local currency · 1st month free · renew day 40'
        />
        <KPICard
          title='Subscribers'
          value={String(subscriptions.length)}
          change={`${subscriptions.filter((item) => item.status === 'Trial').length} on free month`}
        />
        <KPICard
          title="Samuel's Protection Score"
          value={String(health.score)}
          change={health.label}
        />
        <KPICard
          title='Renewal Nudges'
          value={String(alerts.length)}
          change='Day-35 push · day-39 SMS'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Subscriptions'
          description='Per-country plans at 10 currency units; trial, renewal, and nudge state per subscriber.'
          searchPlaceholder='Search subscribers...'
          columns={subscriptionColumns}
          data={subscriptions}
          emptyTitle='No subscribers'
          emptyDescription='No subscriptions yet.'
          emptyAction={<Button>New Subscriber</Button>}
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Engagement Feed'
          description='Why the app earns its place: weather alerts, safety tips, milestones, referrals — each with a WhatsApp-ready forward text.'
          searchPlaceholder='Search feed...'
          columns={feedColumns}
          data={feed}
          emptyTitle='No content'
          emptyDescription='No engagement content published.'
          emptyAction={<Button>Publish Content</Button>}
        />
      </div>

      <DomainEntityList
        title='Newsletter — The Cover Letter'
        description='Monthly thread of radical transparency: published claim rules, where the 10 bob goes, real payout stories.'
        searchPlaceholder='Search issues...'
        columns={issueColumns}
        data={newsletter}
        emptyTitle='No issues'
        emptyDescription='No newsletter issues published.'
        emptyAction={<Button>Draft Issue</Button>}
      />
    </DomainModulePage>
  );
}
