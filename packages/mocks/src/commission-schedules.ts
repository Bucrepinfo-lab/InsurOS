import type { CommissionSchedule } from "@insuros/domain";

export const mockCommissionSchedules: CommissionSchedule[] = [
  {
    id: "comm-sched-agent",
    name: "Constituency Agent — Standard",
    rank: "Constituency Agent",
    insuranceLine: "All",
    directRatePercent: 10,
    overrideRatePercent: 0,
    effectiveFrom: "2026-01-01T00:00:00Z",
    status: "Active"
  },
  {
    id: "comm-sched-county",
    name: "County Manager — Standard",
    rank: "County Manager",
    insuranceLine: "All",
    directRatePercent: 6,
    overrideRatePercent: 2.5,
    effectiveFrom: "2026-01-01T00:00:00Z",
    status: "Active"
  },
  {
    id: "comm-sched-national",
    name: "National Manager — Standard",
    rank: "National Manager",
    insuranceLine: "All",
    directRatePercent: 3,
    overrideRatePercent: 1.5,
    effectiveFrom: "2026-01-01T00:00:00Z",
    status: "Active"
  },
  {
    id: "comm-sched-continental",
    name: "Continental Director — Standard",
    rank: "Continental Director",
    insuranceLine: "All",
    directRatePercent: 0,
    overrideRatePercent: 0.75,
    effectiveFrom: "2026-01-01T00:00:00Z",
    status: "Active"
  }
];
