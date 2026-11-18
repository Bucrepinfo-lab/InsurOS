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

  it("takes the time and the pin from the camera's own data when the phone gives no location", async () => {
    const original = Uint8Array.from(atob("/9j/4AAQSkZJRgABAQAAAQABAAD/4QDORXhpZgAATU0AKgAAAAgAAodpAAQAAAABAAAAJoglAAQAAAABAAAAYAAAAAAAApADAAIAAAAUAAAARJARAAIAAAAHAAAAWAAAAAAyMDI2OjExOjE4IDE0OjMyOjA1ACswMzowMAAAAAQAAQACAAAAAlMAAAAAAgAFAAAAAwAAAJYAAwACAAAAAkUAAAAABAAFAAAAAwAAAK4AAAAAAAAAAQAAAAEAAAARAAAAAQAAAxUAAAAZAAAAJAAAAAEAAAAxAAAAAQAAAdcAAAAZ/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgACAAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Ar0UUUAf/2Q=="), (c) => c.charCodeAt(0));
    const service = new ClaimPhotoService(new MemoryPhotoStorage());
    const added = await service.add(
      { claimReference: "CLM-PHOTO-3", kind: "motor", slot: "front", original, view: jpeg(9), takenAt: "2026-11-18T12:00:00Z", uploadedBy: who },
      new Date("2026-11-18T11:40:00Z")
    );
    expect(added.ok && added.photo).toMatchObject({
      capturedAt: "2026-11-18T11:32:05.000Z",
      timeSource: "photo",
      latitude: -1.2921,
      longitude: 36.8219,
      locationSource: "photo",
      liveCapture: true
    });
    const shown = await service.show("CLM-PHOTO-3");
    expect(shown[0]!.integrity.checks.find((check) => check.code === "GEO_PRESENT")?.passed).toBe(true);
  });
});
