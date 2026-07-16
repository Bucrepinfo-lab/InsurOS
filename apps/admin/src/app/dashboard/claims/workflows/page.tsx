import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from "@insuros/ui";
import { ClaimService } from "@insuros/services";
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Claim workflows' };

const claimService = new ClaimService();

export default async function ClaimWorkflowsPage() {
  const workflows = await claimService.getClaimWorkflows();

  type ClaimWorkflowRow = (typeof workflows)[number];

  const columns: DataTableColumn<ClaimWorkflowRow>[] = [
    { key: "claimId", header: "Claim" },
    { key: "stage", header: "Stage" },
    {
      key: "workflowStatus",
      header: "Status",
      render: (row) => (
        <Badge
          tone={
            row.workflowStatus === "Approved"
              ? "success"
              : row.workflowStatus === "Rejected" || row.workflowStatus === "Escalated"
                ? "danger"
                : "warning"
          }
        >
          {row.workflowStatus}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title="Claim Workflows"
      description="Track claim workflow stages and execution status across FNOL, assessment, investigation, settlement, and closure."
      actions={<ActionButton label='Configure Claim Workflow' action={queueDemoRequest.bind(null, 'Configure Claim Workflow')} />}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard title="Claim Workflows" value={String(workflows.length)} change="Tracked claims" />
        <KPICard title="In Review" value={String(workflows.filter((item) => item.workflowStatus === "In Review").length)} change="Needs action" />
        <KPICard title="Approved" value={String(workflows.filter((item) => item.workflowStatus === "Approved").length)} change="Ready to progress" />
      </div>

      <DomainEntityList
        title="Claim Workflow Status"
        description="Workflow state visibility for active claim journeys."
        searchPlaceholder="Search claim workflows..."
        columns={columns}
        data={workflows}
        emptyTitle="No claim workflows"
        emptyDescription="No claim workflow records are currently available."
        emptyAction={<Button>Configure Claim Workflow</Button>}
        actions={<Button variant="secondary">Export</Button>}
      />
    </DomainModulePage>
  );
}
