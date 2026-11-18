import { describe, expect, it } from "vitest";
import { CLAIM_DECLARATION, checkSignature } from "../src";

const jpeg = (size: number) => Uint8Array.from([0xff, 0xd8, ...new Array(size).fill(7)]);

describe("signing on screen", () => {
  it("needs a real name, agreement and a drawn signature", () => {
    expect(checkSignature({ name: "  Jane   Wanjiru ", agreed: "yes", image: jpeg(500) })).toEqual({ ok: true, name: "Jane Wanjiru" });
    expect(checkSignature({ name: "J", agreed: "yes", image: jpeg(500) })).toMatchObject({ ok: false });
    expect(checkSignature({ name: "Jane <b>", agreed: "yes", image: jpeg(500) })).toMatchObject({ ok: false });
    expect(checkSignature({ name: "Jane Doe", agreed: "no", image: jpeg(500) })).toMatchObject({ ok: false });
    expect(checkSignature({ name: "Jane Doe", agreed: "yes", image: jpeg(10) })).toMatchObject({ ok: false });
    expect(checkSignature({ name: "Jane Doe", agreed: "yes", image: Uint8Array.from(new Array(500).fill(1)) })).toMatchObject({ ok: false });
  });

  it("keeps the declaration honest and plain", () => {
    expect(CLAIM_DECLARATION).toMatch(/true and complete/);
    expect(CLAIM_DECLARATION).not.toMatch(/!|guarantee/i);
  });
});
