import { describe, expect, it } from "vitest";
import { jpegSize, makePdf, wrap } from "../src";

const text = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join("");

describe("PDF writer", () => {
  it("writes a valid-looking PDF with a cross-reference table and pages", () => {
    const rows = Array.from({ length: 120 }, (_, i) => [`POL-${i}`, "Jane (Doe) \\ ünï ✓", "KES 42,000"]);
    const pdf = text(makePdf({ title: "Policies", subtitle: "Test", footer: "InsurOS", blocks: [{ kind: "pairs", rows: [["A", "B"]] }, { kind: "table", headers: ["Policy", "Customer", "Premium"], rows }] }));
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pdf).toContain("xref");
    const count = Number(/\/Count (\d+)/.exec(pdf)?.[1]);
    expect(count).toBeGreaterThan(1);
    // Parentheses and backslashes are escaped; Latin-1 stays one byte; other characters become "?".
    expect(pdf).toContain("Jane \\(Doe\\) \\\\ ünï ?");
    // Each xref offset points at its object.
    const xref = pdf.slice(pdf.indexOf("xref"));
    const offsets = [...xref.matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
    offsets.forEach((offset, i) => expect(pdf.slice(offset, offset + 12)).toMatch(new RegExp(`^${i + 1} 0 obj`)));
  });

  it("wraps text to a width and splits words that are too long", () => {
    expect(wrap("one two three four five", 40, 10)).toEqual(["one two", "three", "four", "five"]);
    expect(wrap("abcdefghijkl", 40, 10)).toEqual(["abcdefgh", "ijkl"]);
  });

  it("reads a JPEG's size from its header", () => {
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x20, 0x00, 0x40, 0x03]);
    expect(jpegSize(jpeg)).toEqual({ width: 64, height: 32 });
    expect(jpegSize(Uint8Array.from([1, 2, 3]))).toBeNull();
  });
});
