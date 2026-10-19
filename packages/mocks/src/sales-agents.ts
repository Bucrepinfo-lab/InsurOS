import type { SalesAgent } from "@insuros/domain";

export const mockSalesAgents: SalesAgent[] = [
  {
    id: "sales-global-1",
    name: "Sofia Marquez",
    email: "sofia.marquez@insuros.example",
    rank: "Global Sales Head",
    regionId: "region-global",
    status: "Active",
    joinedAt: "2026-01-05T08:00:00Z"
  },
  {
    id: "sales-af-1",
    name: "Kwame Mensah",
    email: "kwame.mensah@insuros.example",
    rank: "Continental Director",
    regionId: "region-af",
    supervisorId: "sales-global-1",
    status: "Active",
    joinedAt: "2026-01-20T08:00:00Z"
  },
  {
    id: "sales-eu-1",
    name: "Isabelle Laurent",
    email: "isabelle.laurent@insuros.example",
    rank: "Continental Director",
    regionId: "region-eu",
    supervisorId: "sales-global-1",
    status: "Active",
    joinedAt: "2026-01-22T08:00:00Z"
  },
  {
    id: "sales-ke-1",
    name: "Brian Kiprop",
    email: "brian.kiprop@insuros.example",
    rank: "National Manager",
    regionId: "region-ke",
    supervisorId: "sales-af-1",
    status: "Active",
    joinedAt: "2026-02-01T08:00:00Z"
  },
  {
    id: "sales-ng-1",
    name: "Ngozi Balogun",
    email: "ngozi.balogun@insuros.example",
    rank: "National Manager",
    regionId: "region-ng",
    supervisorId: "sales-af-1",
    status: "Active",
    joinedAt: "2026-02-05T08:00:00Z"
  },
  {
    id: "sales-nairobi-1",
    name: "Faith Njeri",
    email: "faith.njeri@insuros.example",
    rank: "County Manager",
    regionId: "region-ke-047",
    supervisorId: "sales-ke-1",
    status: "Active",
    joinedAt: "2026-02-15T08:00:00Z"
  },
  {
    id: "sales-agent-westlands-1",
    name: "Peter Otieno",
    email: "peter.otieno@insuros.example",
    rank: "Constituency Agent",
    regionId: "region-ke-047-westlands",
    supervisorId: "sales-nairobi-1",
    status: "Active",
    joinedAt: "2026-03-01T08:00:00Z"
  },
  {
    id: "sales-agent-kibra-1",
    name: "Lucy Wambui",
    email: "lucy.wambui@insuros.example",
    rank: "Constituency Agent",
    regionId: "region-ke-047-kibra",
    supervisorId: "sales-nairobi-1",
    status: "Onboarding",
    joinedAt: "2026-06-20T08:00:00Z"
  }
];
