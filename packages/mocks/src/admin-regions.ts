import type { AdminRegion } from "@insuros/domain";

export const mockAdminRegions: AdminRegion[] = [
  // ── Global ────────────────────────────────────────────────────────────────
  {
    id: "region-global",
    name: "InsurOS Global",
    code: "GLOBAL",
    level: "SuperAdmin",
    continentCode: "GLOBAL",
    status: "Active"
  },

  // ── Continents ────────────────────────────────────────────────────────────
  {
    id: "region-af",
    name: "Africa",
    code: "AF",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-eu",
    name: "Europe",
    code: "EU",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "EU",
    status: "Active"
  },
  {
    id: "region-na",
    name: "North America",
    code: "NA",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "NA",
    status: "Active"
  },
  {
    id: "region-sa",
    name: "South America",
    code: "SA",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "SA",
    status: "Active"
  },
  {
    id: "region-as",
    name: "Asia",
    code: "AS",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "AS",
    status: "Active"
  },
  {
    id: "region-oc",
    name: "Oceania",
    code: "OC",
    level: "Continental",
    parentRegionId: "region-global",
    continentCode: "OC",
    status: "Active"
  },

  // ── Nations ───────────────────────────────────────────────────────────────
  {
    id: "region-ke",
    name: "Kenya",
    code: "KE",
    level: "National",
    parentRegionId: "region-af",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-ng",
    name: "Nigeria",
    code: "NG",
    level: "National",
    parentRegionId: "region-af",
    countryCode: "NG",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-gb",
    name: "United Kingdom",
    code: "GB",
    level: "National",
    parentRegionId: "region-eu",
    countryCode: "GB",
    continentCode: "EU",
    status: "Active"
  },
  {
    id: "region-us",
    name: "United States",
    code: "US",
    level: "National",
    parentRegionId: "region-na",
    countryCode: "US",
    continentCode: "NA",
    status: "Active"
  },
  {
    id: "region-br",
    name: "Brazil",
    code: "BR",
    level: "National",
    parentRegionId: "region-sa",
    countryCode: "BR",
    continentCode: "SA",
    status: "Active"
  },
  {
    id: "region-in",
    name: "India",
    code: "IN",
    level: "National",
    parentRegionId: "region-as",
    countryCode: "IN",
    continentCode: "AS",
    status: "Active"
  },
  {
    id: "region-au",
    name: "Australia",
    code: "AU",
    level: "National",
    parentRegionId: "region-oc",
    countryCode: "AU",
    continentCode: "OC",
    status: "Active"
  },

  // ── Counties (Kenya reference implementation) ─────────────────────────────
  {
    id: "region-ke-047",
    name: "Nairobi County",
    code: "KE-047",
    level: "County",
    parentRegionId: "region-ke",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-ke-001",
    name: "Mombasa County",
    code: "KE-001",
    level: "County",
    parentRegionId: "region-ke",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  },

  // ── Constituencies (Nairobi reference implementation) ─────────────────────
  {
    id: "region-ke-047-westlands",
    name: "Westlands Constituency",
    code: "KE-047-WST",
    level: "Constituency",
    parentRegionId: "region-ke-047",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-ke-047-kibra",
    name: "Kibra Constituency",
    code: "KE-047-KBR",
    level: "Constituency",
    parentRegionId: "region-ke-047",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  },
  {
    id: "region-ke-001-mvita",
    name: "Mvita Constituency",
    code: "KE-001-MVT",
    level: "Constituency",
    parentRegionId: "region-ke-001",
    countryCode: "KE",
    continentCode: "AF",
    status: "Active"
  }
];
