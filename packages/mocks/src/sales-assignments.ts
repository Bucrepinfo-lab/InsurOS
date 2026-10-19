import type { SalesAssignment } from "@insuros/domain";

export const mockSalesAssignments: SalesAssignment[] = [
  {
    id: "sales-assign-1",
    agentId: "sales-af-1",
    assignedBy: "sales-global-1",
    regionId: "region-af",
    targetPremium: 500_000_000,
    currency: "USD",
    period: "2026-H2",
    assignedAt: "2026-06-25T08:00:00Z",
    status: "Accepted",
    notes: "Continental growth target for Africa."
  },
  {
    id: "sales-assign-2",
    agentId: "sales-ke-1",
    assignedBy: "sales-af-1",
    regionId: "region-ke",
    targetPremium: 6_500_000_000,
    currency: "KES",
    period: "2026-H2",
    assignedAt: "2026-06-26T08:00:00Z",
    status: "Accepted"
  },
  {
    id: "sales-assign-3",
    agentId: "sales-nairobi-1",
    assignedBy: "sales-ke-1",
    regionId: "region-ke-047",
    targetPremium: 1_800_000_000,
    currency: "KES",
    period: "2026-Q3",
    assignedAt: "2026-06-28T08:00:00Z",
    status: "Assigned"
  },
  {
    id: "sales-assign-4",
    agentId: "sales-agent-westlands-1",
    assignedBy: "sales-nairobi-1",
    regionId: "region-ke-047-westlands",
    targetPremium: 240_000_000,
    currency: "KES",
    period: "2026-Q3",
    assignedAt: "2026-07-01T08:00:00Z",
    status: "Accepted"
  },
  {
    id: "sales-assign-5",
    agentId: "sales-agent-kibra-1",
    assignedBy: "sales-nairobi-1",
    regionId: "region-ke-047-kibra",
    targetPremium: 150_000_000,
    currency: "KES",
    period: "2026-Q3",
    assignedAt: "2026-07-02T08:00:00Z",
    status: "Assigned",
    notes: "Onboarding agent — reduced first-quarter target."
  }
];
