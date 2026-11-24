import { describe, expect, it } from "vitest";
import { DATASETS, seedMarker } from "../src/persistence";

describe("seed markers", () => {
  it("keeps the plain name for first-version datasets, so nothing already seeded is seeded again", () => {
    expect(seedMarker(DATASETS.regions)).toBe("regions");
    expect(seedMarker(DATASETS.taxJurisdictions)).toBe("tax_jurisdictions");
  });

  it("re-seeds only the sample policies, claims, customers, follow-ups and messages (demo tenant only)", () => {
    const bumped = Object.values(DATASETS).filter((dataset) => (dataset.seedVersion ?? 1) > 1);
    expect(bumped.map(seedMarker).sort()).toEqual(["claims@v2", "conversations@v2", "customers@v2", "follow_ups@v2", "messages@v2", "policies@v2"]);
    expect(bumped.every((dataset) => dataset.kind === "sample")).toBe(true);
  });
});
