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
import { enrolDemoMicroPolicy } from '@/app/dashboard/actions';
import { MarketingService, MicroinsuranceService } from '@insuros/services';

const microinsuranceService = new MicroinsuranceService();
const marketingService = new MarketingService();

export default async function MicroinsurancePage() {
  const products = await microinsuranceService.getProducts();
  const providers = await microinsuranceService.getProviders();
  const policies = await microinsuranceService.getPolicies();
  const payments = await microinsuranceService.getPayments();
  const [banner] = await marketingService.getContentFor('Micro');

  type ProductRow = (typeof products)[number];
  type PolicyRow = (typeof policies)[number];

  const productColumns: DataTableColumn<ProductRow>[] = [
    { key: 'name', header: 'Product' },
    { key: 'targetSegment', header: 'Segment' },
    {
      key: 'premiumAmount',
      header: 'Premium',
      render: (row) =>
        `${row.currency} ${row.premiumAmount.toLocaleString()} / ${row.premiumFrequency.toLowerCase()}`
    },
    {
      key: 'coverAmount',
      header: 'Cover',
      render: (row) => `${row.currency} ${row.coverAmount.toLocaleString()}`
    },
    {
      key: 'activationChannels',
      header: 'Channels',
      render: (row) => row.activationChannels.join(', ')
    },
    {
      key: 'parametricTrigger',
      header: 'Parametric',
      render: (row) =>
        row.parametricTrigger ? (
          <Badge tone='success'>Auto-payout</Badge>
        ) : (
          '—'
        )
    }
  ];

  const policyColumns: DataTableColumn<PolicyRow>[] = [
    { key: 'holderName', header: 'Holder' },
    { key: 'msisdn', header: 'Mobile' },
    {
      key: 'productId',
      header: 'Product',
      render: (row) =>
        products.find((product) => product.id === row.productId)?.name ??
        row.productId
    },
    { key: 'channel', header: 'Channel' },
    {
      key: 'providerId',
      header: 'Provider',
      render: (row) =>
        providers.find((provider) => provider.id === row.providerId)?.name ??
        row.providerId
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Grace'
                ? 'warning'
                : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Microinsurance'
      description='Micro-premium covers distributed on mobile-money rails (USSD, app, agent, embedded). The mobile number is identity and payment instrument in one — closing the penetration gap.'
      actions={<ActionButton label='Enrol policyholder' action={enrolDemoMicroPolicy} />}
    >
      {banner ? (
        <MarketingBanner
          headline={banner.headline}
          body={banner.body}
          cta={banner.cta}
          ctaHref={banner.ctaHref}
        />
      ) : null}

      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Micro Products'
          value={String(products.filter((product) => product.status === 'Active').length)}
          change='Incl. parametric index covers'
        />
        <KPICard
          title='Policies'
          value={String(policies.length)}
          change='Enrolled holders'
        />
        <KPICard
          title='Active Cover'
          value={String(policies.filter((policy) => policy.status === 'Active').length)}
          change='Payments up to date'
        />
        <KPICard
          title='Payments'
          value={String(payments.length)}
          change='Mobile-money receipts'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Product Catalogue'
          description='Daily/weekly/monthly micro-premiums; parametric products pay automatically on the index trigger — no claim filing at all.'
          searchPlaceholder='Search products...'
          columns={productColumns}
          data={products}
          emptyTitle='No products'
          emptyDescription='No micro products configured.'
          emptyAction={<Button>Create Product</Button>}
        />
      </div>

      <DomainEntityList
        title='Policy Register'
        description='Grace-period logic is deliberately forgiving — the segment has irregular income.'
        searchPlaceholder='Search policies...'
        columns={policyColumns}
        data={policies}
        emptyTitle='No policies'
        emptyDescription='No micro policies enrolled.'
        emptyAction={<Button>Enrol Policyholder</Button>}
      />
    </DomainModulePage>
  );
}
