import type { AdminAppointment } from "@insuros/domain";

export const mockAdminAppointments: AdminAppointment[] = [
  {
    id: "appointment-super-1",
    userId: "user-super-admin",
    userName: "Jacob Bucrep",
    email: "bucrepinfo@gmail.com",
    regionId: "region-global",
    level: "SuperAdmin",
    roleId: "role-platform-admin",
    appointedBy: "system",
    appointedAt: "2026-01-01T00:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-af-1",
    userId: "user-af-director",
    userName: "Amina Okonkwo",
    email: "amina.okonkwo@insuros.example",
    regionId: "region-af",
    level: "Continental",
    roleId: "role-platform-admin",
    appointedBy: "user-super-admin",
    appointedAt: "2026-01-15T09:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-eu-1",
    userId: "user-eu-director",
    userName: "Elena Kovacs",
    email: "elena.kovacs@insuros.example",
    regionId: "region-eu",
    level: "Continental",
    roleId: "role-platform-admin",
    appointedBy: "user-super-admin",
    appointedAt: "2026-01-15T09:30:00Z",
    status: "Active"
  },
  {
    id: "appointment-ke-1",
    userId: "user-ke-admin",
    userName: "Daniel Mwangi",
    email: "daniel.mwangi@insuros.example",
    regionId: "region-ke",
    level: "National",
    roleId: "role-claims-manager",
    appointedBy: "user-af-director",
    appointedAt: "2026-02-01T08:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-ng-1",
    userId: "user-ng-admin",
    userName: "Chidi Adeyemi",
    email: "chidi.adeyemi@insuros.example",
    regionId: "region-ng",
    level: "National",
    roleId: "role-claims-manager",
    appointedBy: "user-af-director",
    appointedAt: "2026-02-03T10:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-ke-047-1",
    userId: "user-nairobi-admin",
    userName: "Grace Wanjiru",
    email: "grace.wanjiru@insuros.example",
    regionId: "region-ke-047",
    level: "County",
    roleId: "role-finance-manager",
    appointedBy: "user-ke-admin",
    appointedAt: "2026-02-10T11:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-ke-047-wst-1",
    userId: "user-westlands-admin",
    userName: "Peter Otieno",
    email: "peter.otieno@insuros.example",
    regionId: "region-ke-047-westlands",
    level: "Constituency",
    roleId: "role-finance-manager",
    appointedBy: "user-nairobi-admin",
    appointedAt: "2026-02-20T14:00:00Z",
    status: "Active"
  },
  {
    id: "appointment-ke-047-kbr-1",
    userId: "user-kibra-admin",
    userName: "Mary Achieng",
    email: "mary.achieng@insuros.example",
    regionId: "region-ke-047-kibra",
    level: "Constituency",
    roleId: "role-finance-manager",
    appointedBy: "user-nairobi-admin",
    appointedAt: "2026-03-01T09:00:00Z",
    status: "Pending"
  }
];
