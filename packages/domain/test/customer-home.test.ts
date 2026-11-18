import { describe, expect, it } from "vitest";
import { defaultExpiry, depreciationAt, estimateVehicleValue, expiryStatus, policiesOfCustomer } from "../src";

const now = new Date("2026-11-18T09:00:00Z");

describe("customer home", () => {
  it("counts down to expiry and reminds from 30 days before", () => {
    expect(expiryStatus("2027-06-01", now)).toMatchObject({ level: "in-force", days: 195 });
    expect(expiryStatus("2026-12-18", now)).toMatchObject({ level: "due-soon", days: 30, words: "Expires in 30 days" });
    expect(expiryStatus("2026-11-19", now)).toMatchObject({ level: "due-soon", words: "Expires in 1 day" });
    expect(expiryStatus("2026-11-18", now)).toMatchObject({ level: "due-soon", words: "Last day of cover is today" });
    expect(expiryStatus("2026-11-10", now)).toMatchObject({ level: "expired", words: "Expired 8 days ago" });
    expect(expiryStatus(undefined, now)).toMatchObject({ level: "unknown" });
  });

  it("gives a year of cover by default", () => {
    expect(defaultExpiry("2026-11-18")).toBe("2027-11-17");
    expect(defaultExpiry("2024-03-01")).toBe("2025-02-28");
  });

  it("uses KRA's used-vehicle bands exactly, and stops where they stop", () => {
    expect(depreciationAt(0.5)).toBe(0);
    expect(depreciationAt(1.5)).toBe(0.2);
    expect(depreciationAt(4.2)).toBe(0.5);
    expect(depreciationAt(8)).toBe(0.65);
    expect(depreciationAt(9)).toBeNull();
  });

  it("estimates today's value from the value insured at the start of cover", () => {
    // Made 2022, insured 01/03/2025 (age 3.2 -> 40% lost) at 1,500,000; today age 4.9 -> 50% lost.
    const estimate = estimateVehicleValue({ sumInsured: 1_500_000, yearOfManufacture: 2022, startDate: "2025-03-01" }, now);
    expect(estimate).toMatchObject({ insured: 1_500_000, estimateToday: 1_250_000, change: -250_000 });
    expect(estimateVehicleValue({ sumInsured: 900_000, yearOfManufacture: 2014, startDate: "2025-03-01" }, now)?.estimateToday).toBeNull();
    expect(estimateVehicleValue({ sumInsured: 900_000, yearOfManufacture: 2022, startDate: "2025-03-01" }, now, "UG")?.estimateToday).toBeNull();
    expect(estimateVehicleValue({ yearOfManufacture: 2022, startDate: "2025-03-01" }, now)).toBeNull();
  });

  it("finds a customer's policies by record, or by name for older rows", () => {
    const rows = [
      { id: "1", customer: "Jane Doe", customerId: "c1" },
      { id: "2", customer: "Jane Doe" },
      { id: "3", customer: "Jane Doe", customerId: "c2" },
      { id: "4", customer: "John" }
    ];
    expect(policiesOfCustomer(rows, { id: "c1", name: "Jane Doe" }).map((p) => p.id)).toEqual(["1", "2"]);
  });
});
