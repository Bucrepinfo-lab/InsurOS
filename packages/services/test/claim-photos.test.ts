import { describe, expect, it } from "vitest";
import { ClaimPhotoService, MemoryPhotoStorage } from "../src";

const jpeg = (n: number) => Uint8Array.from([0xff, 0xd8, 0xff, n, 1, 2, 3]);
const who = { kind: "customer" as const, id: "customer", name: "Jane" };

describe("ClaimPhotoService", () => {
  it("keeps the untouched original with its fingerprint, and a clear copy, privately", async () => {
    const service = new ClaimPhotoService(new MemoryPhotoStorage());
    const now = new Date("2035-01-01T10:00:00Z");
    const added = await service.add(
      {
        claimReference: "CLM-PHOTO-1",
        kind: "motor",
        slot: "front",
        original: jpeg(1),
        view: jpeg(2),
        takenAt: "2035-01-01T09:58:00Z",
        location: { latitude: -1.29, longitude: 36.82, accuracy: 12 },
        uploadedBy: who
      },
      now
    );
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(added.photo).toMatchObject({ liveCapture: true, slot: "front", geoAccuracyMeters: 12, bytes: 7 });
    expect(added.photo.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(added.photo.storagePath).not.toBe(added.photo.viewPath);

    const shown = await service.show("CLM-PHOTO-1");
    expect(shown).toHaveLength(1);
    expect(shown[0]!.viewUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(shown[0]!.integrity.verdict).toBe("Strong");
  });

  it("refuses a bad claim number or a file that is not a photo", async () => {
    const service = new ClaimPhotoService(new MemoryPhotoStorage());
    expect(await service.add({ claimReference: "../etc", kind: "motor", slot: "front", original: jpeg(1), view: jpeg(2), uploadedBy: who })).toMatchObject({ ok: false });
    expect(await service.add({ claimReference: "CLM-PHOTO-2", kind: "motor", slot: "front", original: new TextEncoder().encode("hello"), view: jpeg(2), uploadedBy: who })).toMatchObject({ ok: false });
  });
});
