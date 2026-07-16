import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from "@insuros/ui";
import { WorkflowService } from "@insuros/services";
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Policies' };

const workflowService = new WorkflowService();

export default async function WorkflowPoliciesPage() {
  const policies = await workflowService.getWorkflowPolicies();

  type PolicyRow = (typeof policies)[number];

  const columns: DataTableColumn<PolicyRow>[] = [
    { key: "workflowType", header: "Workflow Type" },
    { key: "action", header: "Action" },
    {
      key: "requiredRoles",
      header: "Roles",
      render: (row) => row.requiredRoles.join(", ")
    },
    {
      key: "requiresApproval",
      header: "Approval",
      render: (row) => (
        <Badge tone={row.requiresApproval ? "success" : "neutral"}>
          {row.requiresApproval ? "Required" : "No"}
        </Badge>
      )
    },
    {
      key: "requiresReason",
      header: "Reason",
      render: (row) => (
        <Badge tone={row.requiresReason ? "warning" : "neutral"}>
          {row.requiresReason ? "Required" : "No"}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title="Workflow Policies"
      description="Configure authorization and approval policies for workflow actions."
      actions={<ActionButton label='Create Policy' action={queueDemoRequest.bind(null, 'Create Policy')} />}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <KPICard
          title="Policies"
          value={String(policies.length)}
          change="Configured"
        />

        <KPICard
          title="Approval Policies"
          value={String(policies.filter(p => p.requiresApproval).length)}
          change="Require approval"
        />

        <KPICard
          title="Reason Policies"
          value={String(policies.filter(p => p.requiresReason).length)}
          change="Require reason"
        />
      </div>

      <DomainEntityList
        title="Workflow Policies"
        description="Authorization and execution policies."
        searchPlaceholder="Search policies..."
        columns={columns}
        data={policies}
        emptyTitle="No policies"
        emptyDescription="No workflow policies configured."
        emptyAction={<Button>Create Policy</Button>}
        actions={<Button variant="secondary">Export</Button>}
      />
    </DomainModulePage>
  );
}
