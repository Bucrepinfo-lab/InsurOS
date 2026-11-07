import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_TENANT_ID, DEMO_TENANT_ID } from "@insuros/domain";
import { getPersistence, setTenantResolver } from "../src";

describe("tenant-routing persistence (memory backend)", () => {
  afterEach(() => setTenantResolver(undefined));

  it("routes each call to the tenant chosen by the server-side resolver", async () => {
    let tenant = DEMO_TENANT_ID;
    setTenantResolver(async () => tenant);
    const db = getPersistence();

    const id = `demo-claim-${Date.now()}`;
    await db.claims.insert({ id, claimNumber: "DEMO" } as never);
    expect(await db.claims.findById(id)).toBeDefined();

    tenant = DEFAULT_TENANT_ID;
    expect(await db.claims.findById(id)).toBeUndefined();
  });

  it("a failing resolver falls back to the default tenant", async () => {
    setTenantResolver(async () => {
      throw new Error("no request scope");
    });
    const before = (await getPersistence().regions.findAll()).length;
    expect(before).toBeGreaterThan(0);
  });
});
