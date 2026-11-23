import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from "@insuros/ui";
import { ClaimService } from "@insuros/services";
import { RecordLink } from "@/components/record-view";
import { currentReach } from "@/lib/record-scope";
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Claim workflows' };

const claimService = new ClaimService();

export default async function ClaimWorkflowsPage() {
  // Only workflows of claims this person may see in this tenant: the workflow
  // list itself is shared sample data and must not show claims that are not here.
  const visible = new Set((await claimService.getClaimsFor(await currentReach("Claims"))).map((claim) => claim.id));
  const workflows = (await claimService.getClaimWorkflows()).filter((workflow) => visible.has(workflow.claimId));

  type ClaimWorkflowRow = (typeof workflows)[number];

  const columns: DataTableColumn<ClaimWorkflowRow>[] = [
    {
      key: "claimId",
      header: "Claim",
      render: (row) => <RecordLink href={`/dashboard/claims/${encodeURIComponent(row.claimId)}`}>{row.claimId}</RecordLink>
    },
    { key: "stage", header: "Stage", render: (row) => (row.stage === "FNOL" ? "First notice" : row.stage) },
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
      title="Claim workflow"
      description="Where each claim stands: first notice, assessment, investigation, settlement and closure."
      actions={<ActionButton label='Configure Claim Workflow' action={queueDemoRequest.bind(null, 'Configure Claim Workflow')} />}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard title="Claims tracked" value={String(workflows.length)} />
        <KPICard title="In Review" value={String(workflows.filter((item) => item.workflowStatus === "In Review").length)} change="Needs action" />
        <KPICard title="Closed" value={String(workflows.filter((item) => item.workflowStatus === "Closed").length)} change="Settled and closed" />
      </div>

      <DomainEntityList
        title="Claims by stage"
        description="Open a claim to see each step and its settlement."
        searchPlaceholder="Search claims..."
        columns={columns}
        data={workflows}
        emptyTitle="No claims yet"
        emptyDescription="A claim appears here once it is registered."
      />
    </DomainModulePage>
  );
}
