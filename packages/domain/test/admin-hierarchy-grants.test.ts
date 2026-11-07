import { describe, expect, it } from "vitest";
import { isGrantableRegion } from "../src";

describe("staff grants only in Active regions (owner-approved 07/11/26)", () => {
  it("allows Active and refuses Suspended", () => {
    expect(isGrantableRegion({ status: "Active" })).toBe(true);
    expect(isGrantableRegion({ status: "Suspended" })).toBe(false);
  });
});
