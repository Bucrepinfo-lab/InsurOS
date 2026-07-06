import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import type { ScopedAccessRequest } from '@insuros/domain';
import {
  AdminHierarchyService,
  JurisdictionAuthorizationService,
  RoleService
} from '@insuros/services';

const authorizationService = new JurisdictionAuthorizationService();
const adminHierarchyService = new AdminHierarchyService();
const roleService = new RoleService();

const previewRequests: ScopedAccessRequest[] = [
  {
    userId: 'user-nairobi-admin',
    scope: 'Finance',
    action: 'Approve',
    targetRegionId: 'region-ke-047-westlands'
  },
  {
    userId: 'user-nairobi-admin',
    scope: 'Finance',
    action: 'Approve',
    targetRegionId: 'region-ke-001'
  },
  {
    userId: 'user-ke-admin',
    scope: 'Claims',
    action: 'Approve',
    targetRegionId: 'region-ke-047-kibra'
  },
  {
    userId: 'user-ke-admin',
    scope: 'Claims',
    action: 'Approve',
    targetRegionId: 'region-ng'
  },
  {
    userId: 'user-ng-admin',
    scope: 'Claims',
    action: 'View',
    targetRegionId: 'region-ng'
  },
  {
    userId: 'user-super-admin',
    scope: 'Platform',
    action: 'Update',
    targetRegionId: 'region-br'
  }
];

export default async function JurisdictionAccessPage() {
  const assignments = await authorizationService.getAssignments();
  const regions = await adminHierarchyService.getRegions();
  const roles = await roleService.getRoles();

  const decisions = await Promise.all(
    previewRequests.map(async (request) => ({
      request,
      decision: await authorizationService.authorize(request)
    }))
  );

  type AssignmentRow = (typeof assignments)[number];
  type DecisionRow = (typeof decisions)[number];

  const regionName = (id: string) =>
    regions.find((region) => region.id === id)?.name ?? id;

  const assignmentColumns: DataTableColumn<AssignmentRow>[] = [
    { key: 'userName', header: 'User' },
    {
      key: 'roleId',
      header: 'Role',
      render: (row) => roles.find((role) => role.id === row.roleId)?.name ?? row.roleId
    },
    {
      key: 'regionId',
      header: 'Jurisdiction',
      render: (row) => regionName(row.regionId)
    },
    { key: 'assignedBy', header: 'Assigned By' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Suspended'
                ? 'warning'
                : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  const decisionColumns: DataTableColumn<DecisionRow>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) =>
        assignments.find((item) => item.userId === row.request.userId)
          ?.userName ?? row.request.userId
    },
    {
      key: 'permission',
      header: 'Permission',
      render: (row) => `${row.request.scope}:${row.request.action}`
    },
    {
      key: 'target',
      header: 'Target Region',
      render: (row) => regionName(row.request.targetRegionId)
    },
    {
      key: 'decision',
      header: 'Decision',
      render: (row) => (
        <Badge tone={row.decision.allowed ? 'success' : 'danger'}>
          {row.decision.allowed ? 'Allowed' : 'Denied'}
        </Badge>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => row.decision.reason
    }
  ];

  return (
    <DomainModulePage
      title='Jurisdiction Access'
      description='Region-bound RBAC: a role acts only inside its assigned jurisdiction and descendants. Foundation for Clerk production role mapping.'
      actions={<Button>Grant Access</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Scoped Assignments'
          value={String(assignments.length)}
          change='Role × jurisdiction grants'
        />
        <KPICard
          title='Active'
          value={String(assignments.filter((item) => item.status === 'Active').length)}
          change='Currently enforceable'
        />
        <KPICard
          title='Suspended / Revoked'
          value={String(assignments.filter((item) => item.status !== 'Active').length)}
          change='Access withheld'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Jurisdiction Assignments'
          description='Who holds which role, where — and who granted it.'
          searchPlaceholder='Search assignments...'
          columns={assignmentColumns}
          data={assignments}
          emptyTitle='No assignments'
          emptyDescription='No jurisdiction-scoped roles have been granted.'
          emptyAction={<Button>Grant Access</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />
      </div>

      <DomainEntityList
        title='Authorization Preview'
        description='Live decisions from the authorization engine — including cross-county denials and suspended-grant denials.'
        searchPlaceholder='Search decisions...'
        columns={decisionColumns}
        data={decisions}
        emptyTitle='No preview cases'
        emptyDescription='No authorization preview cases configured.'
      />
    </DomainModulePage>
  );
}
