import { WorkflowInstance } from "@insuros/domain";

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