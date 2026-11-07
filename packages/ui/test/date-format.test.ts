import { describe, expect, it } from "vitest";
import { displayValue, formatDate, formatDateTime, formatTime, isIsoDateLike } from "../src/utils/date-format";
import { cellText, filterRows, listParamName, readParam, rowCells } from "../src/data/filter-rows";

describe("shared day-first date formatter (owner rule: dd/mm/yy everywhere)", () => {
  it("shows calendar dates day-first without shifting the day", () => {
    expect(formatDate("2026-11-07")).toBe("07/11/26");
    expect(formatDate("2026-11-07", { fullYear: true })).toBe("07/11/2026");
    // A date where month-first would read differently (the Android bug).
    expect(formatDate("2026-07-11")).toBe("11/07/26");
  });

  it("shows date-times on the Nairobi clock (EAT, UTC+3), 24-hour", () => {
    expect(formatDateTime("2026-11-07T21:30:00.000Z")).toBe("08/11/26 00:30");
    expect(formatDateTime("2026-11-07T06:05:00Z")).toBe("07/11/26 09:05");
    expect(formatTime("2026-11-07T06:05:00Z")).toBe("09:05");
    expect(formatDate("2026-11-07T21:30:00Z")).toBe("08/11/26");
  });

  it("honours another country's time zone when given", () => {
    expect(formatDateTime("2026-11-07T21:30:00Z", { timeZone: "Africa/Lagos" })).toBe("07/11/26 22:30");
  });

  it("is day-first even where the device locale is month-first", () => {
    // A month-first locale (as on many Android devices) would print 7/11/2026.
    expect(new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(new Date("2026-07-11T12:00:00Z"))).toBe("7/11/2026");
    expect(formatDate("2026-07-11T12:00:00Z")).toBe("11/07/26");
  });

  it("leaves non-dates alone and handles empty input", () => {
    expect(isIsoDateLike("POL-2026-0001")).toBe(false);
    expect(isIsoDateLike("2026-11-07")).toBe(true);
    expect(displayValue("KES 42,000")).toBe("KES 42,000");
    expect(displayValue(42)).toBe("42");
    expect(displayValue(undefined)).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate("not a date")).toBe("not a date");
    expect(displayValue("2026-11-07T06:05:00Z")).toBe("07/11/26 09:05");
  });
});

describe("list filtering shared by table, summary cards and CSV export", () => {
  type Row = { id: string; customer: string; status: string; issuedAt: string };
  const columns = [
    { key: "id", header: "No." },
    { key: "customer", header: "Customer" },
    { key: "status", header: "Status", render: (row: Row) => ({ badge: row.status }) },
    { key: "issuedAt", header: "Issued" }
  ];
  const rows: Row[] = [
    { id: "P-1", customer: "Amos Mutua", status: "Active", issuedAt: "2026-07-11" },
    { id: "P-2", customer: "Beatrice Wanjiku", status: "Cancelled", issuedAt: "2026-11-07" }
  ];

  it("cell text uses rendered text when plain, raw value otherwise, dates day-first", () => {
    expect(cellText(rows[0], columns[2])).toBe("Active");
    expect(rowCells(rows[0], columns)).toEqual(["P-1", "Amos Mutua", "Active", "11/07/26"]);
  });

  it("filters case-insensitively over what the user sees (including day-first dates)", () => {
    expect(filterRows(rows, columns, "amos").map((row) => row.id)).toEqual(["P-1"]);
    expect(filterRows(rows, columns, "07/11/26").map((row) => row.id)).toEqual(["P-2"]);
    expect(filterRows(rows, columns, "2026-11-07")).toEqual([]);
    expect(filterRows(rows, columns, "  ")).toHaveLength(2);
  });

  it("reads URL params and derives list param names", () => {
    expect(readParam({ q: [" amos ", "x"] }, "q")).toBe("amos");
    expect(readParam(undefined, "q")).toBe("");
    expect(listParamName("Jurisdiction Assignments")).toBe("jurisdiction-assignments");
  });
});
