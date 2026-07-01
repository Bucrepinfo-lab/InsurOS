
import type { WorkflowInstance, WorkflowTask } from "@insuros/domain";
export const mockWorkflows: WorkflowInstance[] = [
  {
    id: "wf-001",
    reference: "CLM-2026-0001",
    name: "Motor Claim Assessment",
    module: "Claims",
    status: "In Review",
    priority: "High",
    assignee: "Claims Officer",
    dueAt: "2026-07-10"
  },
  {
    id: "wf-002",
    reference: "POL-2026-0145",
    name: "Policy Issuance",
    module: "Policies",
    status: "Submitted",
    priority: "Normal",
    assignee: "Underwriting",
    dueAt: "2026-07-05"
  },
  {
    id: "wf-003",
    reference: "FIN-2026-0088",
    name: "Invoice Reconciliation",
    module: "Finance",
    status: "Escalated",
    priority: "Critical",
    assignee: "Finance Manager",
    dueAt: "2026-07-02"
  }
];

export const mockWorkflowTasks: WorkflowTask[] = [
  {
    id: "task-001",
    workflowId: "wf-001",
    title: "Review claim assessment",
    module: "Claims",
    status: "In Progress",
    priority: "High",
    assignee: "Claims Officer",
    dueAt: "2026-07-10"
  },
  {
    id: "task-002",
    workflowId: "wf-002",
    title: "Approve policy issuance",
    module: "Policies",
    status: "Open",
    priority: "Normal",
    assignee: "Underwriting",
    dueAt: "2026-07-05"
  },
  {
    id: "task-003",
    workflowId: "wf-003",
    title: "Resolve invoice mismatch",
    module: "Finance",
    status: "Blocked",
    priority: "Critical",
    assignee: "Finance Manager",
    dueAt: "2026-07-02"
  }
];