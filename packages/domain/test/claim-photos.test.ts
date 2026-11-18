import { describe, expect, it } from "vitest";
import { MAX_PHOTOS_PER_CLAIM, PHOTO_GUIDES, checkUpload, clarify, latestBySlot, sniffImage, takenOnTheSpot, type ScenePhoto } from "../src";

const jpeg = (size = 10) => Uint8Array.from([0xff, 0xd8, 0xff, ...new Array(size).fill(1)]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]);
const heic = Uint8Array.from([0, 0, 0, 24, ..."ftypheic".split("").map((c) => c.charCodeAt(0))]);

describe("claim photo guides", () => {
  it("asks for ten shots per kind of claim, each with a tip, and covers what assessors ask for on a car", () => {
    for (const guide of Object.values(PHOTO_GUIDES)) {
      expect(guide.slots).toHaveLength(10);
      expect(new Set(guide.slots.map((slot) => slot.id)).size).toBe(10);
      for (const slot of guide.slots) expect(slot.tip.length).toBeGreaterThan(10);
    }
    const motor = PHOTO_GUIDES.motor.slots.map((slot) => slot.id);
    for (const needed of ["front", "rear", "left", "right", "damage-close", "dashboard", "chassis", "scene"]) expect(motor).toContain(needed);
  });
});

describe("upload checks", () => {
  it("knows a photo by its bytes, not its name", () => {
    expect(sniffImage(jpeg())).toBe("image/jpeg");
    expect(sniffImage(png)).toBe("image/png");
    expect(sniffImage(heic)).toBe("image/heic");
    expect(sniffImage(new TextEncoder().encode("<html>"))).toBeNull();
  });

  it("refuses anything that is not a proper photo for a known shot", () => {
    const ok = { kind: "motor", slot: "front", original: jpeg(), view: jpeg(), existing: 0 };
    expect(checkUpload(ok)).toEqual({ ok: true, originalType: "image/jpeg" });
    expect(checkUpload({ ...ok, original: heic })).toEqual({ ok: true, originalType: "image/heic" });
    expect(checkUpload({ ...ok, kind: "boat" })).toMatchObject({ ok: false });
    expect(checkUpload({ ...ok, slot: "selfie" })).toMatchObject({ ok: false });
    expect(checkUpload({ ...ok, original: new TextEncoder().encode("not a photo") })).toMatchObject({ ok: false });
    expect(checkUpload({ ...ok, view: png })).toMatchObject({ ok: false });
    expect(checkUpload({ ...ok, original: new Uint8Array(13 * 1024 * 1024) })).toMatchObject({ ok: false });
    expect(checkUpload({ ...ok, existing: MAX_PHOTOS_PER_CLAIM })).toMatchObject({ ok: false });
  });

  it("calls a photo taken on the spot only when the phone's time is just before upload", () => {
    const received = "2026-11-18T10:00:00.000Z";
    expect(takenOnTheSpot("2026-11-18T09:50:00.000Z", received)).toBe(true);
    expect(takenOnTheSpot("2026-11-18T09:00:00.000Z", received)).toBe(false);
    expect(takenOnTheSpot("2026-11-18T10:05:00.000Z", received)).toBe(false);
    expect(takenOnTheSpot(undefined, received)).toBe(false);
  });

  it("shows the newest photo for each shot in the guide's order", () => {
    const photo = (slot: string, receivedAt: string, id: string) => ({ id, slot, receivedAt }) as ScenePhoto;
    const lines = latestBySlot([photo("rear", "2026-01-01T00:00:00Z", "a"), photo("front", "2026-01-01T00:00:00Z", "b"), photo("front", "2026-01-02T00:00:00Z", "c")], "motor");
    expect(lines[0]).toMatchObject({ slot: { id: "front" }, photo: { id: "c" } });
    expect(lines[1]).toMatchObject({ slot: { id: "rear" }, photo: { id: "a" } });
    expect(lines[2]!.photo).toBeUndefined();
  });
});

describe("clarity filter", () => {
  const image = (fill: (x: number, y: number) => number, w = 8, h = 8) => {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y += 1)
      for (let x = 0; x < w; x += 1) {
        const v = fill(x, y);
        data.set([v, v, v, 200], (y * w + x) * 4);
      }
    return data;
  };

  it("stretches a dull, grey photo to the full range and keeps transparency", () => {
    const dull = image((x) => 100 + x * 5); // 100..135
    const out = clarify(dull, 8, 8, 0);
    expect(Math.min(...Array.from(out).filter((_, i) => i % 4 === 0))).toBe(0);
    expect(Math.max(...Array.from(out).filter((_, i) => i % 4 === 0))).toBe(255);
    expect(out[3]).toBe(200);
    expect(dull[0]).toBe(100); // the input is not changed
  });

  it("does not shift colours: grey stays grey", () => {
    const out = clarify(image((x, y) => 60 + (x + y) * 8), 8, 8);
    for (let i = 0; i < out.length; i += 4) {
      expect(out[i]).toBe(out[i + 1]);
      expect(out[i + 1]).toBe(out[i + 2]);
    }
  });

  it("leaves a flat picture alone rather than blowing up noise", () => {
    const flat = image(() => 120);
    expect(Array.from(clarify(flat, 8, 8))).toEqual(Array.from(flat));
  });

  it("sharpens an edge", () => {
    const edge = image((x) => (x < 4 ? 50 : 200));
    const soft = clarify(edge, 8, 8, 0);
    const sharp = clarify(edge, 8, 8, 0.6);
    const at = (data: Uint8ClampedArray, x: number) => data[(3 * 8 + x) * 4]!;
    expect(at(sharp, 4) - at(sharp, 3)).toBeGreaterThanOrEqual(at(soft, 4) - at(soft, 3));
  });
});
