import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  MarketingBanner,
  type DataTableColumn
} from '@insuros/ui';
import { evaluateSceneIntegrity } from '@insuros/domain';
import { ClaimsAutomationService, MarketingService, SceneCaptureService } from '@insuros/services';

const sceneCaptureService = new SceneCaptureService();
const claimsAutomationService = new ClaimsAutomationService();
const marketingService = new MarketingService();

export default async function SceneEvidencePage() {
  const photos = await sceneCaptureService.getPhotos();
  const fnols = await claimsAutomationService.getFnols();
  const [banner] = await marketingService.getContentFor('ClaimsPortal');

  const results = photos.map((photo) => {
    const fnol = fnols.find(
      (item) => item.claimReference === photo.claimReference
    );

    return {
      photo,
      result: evaluateSceneIntegrity(
        photo,
        fnol?.incidentAt ?? photo.capturedAt
      )
    };
  });

  type Row = (typeof results)[number];

  const columns: DataTableColumn<Row>[] = [
    {
      key: 'claim',
      header: 'Claim',
      render: (row) => row.photo.claimReference
    },
    {
      key: 'liveCapture',
      header: 'Capture',
      render: (row) => (
        <Badge tone={row.photo.liveCapture ? 'success' : 'warning'}>
          {row.photo.liveCapture ? 'Live (in-app camera)' : 'Gallery upload'}
        </Badge>
      )
    },
    {
      key: 'geo',
      header: 'GPS',
      render: (row) =>
        row.photo.latitude !== undefined
          ? `${row.photo.latitude}, ${row.photo.longitude} (±${row.photo.geoAccuracyMeters}m)`
          : '—'
    },
    { key: 'capturedAt', header: 'Captured', render: (row) => row.photo.capturedAt },
    {
      key: 'checks',
      header: 'Integrity Checks',
      render: (row) =>
        row.result.checks
          .map((check) => `${check.passed ? '✓' : '✗'} ${check.code}`)
          .join('  ')
    },
    {
      key: 'verdict',
      header: 'Verdict',
      render: (row) => (
        <Badge
          tone={
            row.result.verdict === 'Strong'
              ? 'success'
              : row.result.verdict === 'Acceptable'
                ? 'warning'
                : 'danger'
          }
        >
          {`${row.result.verdict} (${row.result.score})`}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Scene Evidence'
      description='Customers photograph the scene live in the app — GPS, timestamps, and an on-device hash seal the truth at capture. Strong evidence replaces adjuster visits on small claims.'
      actions={<Button>Register Capture</Button>}
    >
      {banner ? (
        <MarketingBanner
          headline={banner.headline}
          body={banner.body}
          cta={banner.cta}
          ctaHref={banner.ctaHref}
        />
      ) : null}

      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Scene Photos'
          value={String(photos.length)}
          change='All claims'
        />
        <KPICard
          title='Strong Evidence'
          value={String(results.filter((row) => row.result.verdict === 'Strong').length)}
          change='Fast-lane eligible'
        />
        <KPICard
          title='Weak / Suspect'
          value={String(results.filter((row) => row.result.verdict === 'Weak').length)}
          change='Routed to adjuster'
        />
      </div>

      <DomainEntityList
        title='Evidence Register'
        description='Five integrity checks per photo: live capture, timeliness, GPS, real-time upload, hash seal.'
        searchPlaceholder='Search evidence...'
        columns={columns}
        data={results}
        emptyTitle='No evidence'
        emptyDescription='No scene photos registered.'
        emptyAction={<Button>Register Capture</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
