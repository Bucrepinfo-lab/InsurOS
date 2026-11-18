import { describe, expect, it } from "vitest";
import { exifInstant, mapPinUrl, readExif, stampText } from "../src";

// An 8 x 8 JPEG written with the time 18/11/26 14:32:05 +03:00 and a GPS point in Nairobi.
const withExif = Uint8Array.from(atob("/9j/4AAQSkZJRgABAQAAAQABAAD/4QDORXhpZgAATU0AKgAAAAgAAodpAAQAAAABAAAAJoglAAQAAAABAAAAYAAAAAAAApADAAIAAAAUAAAARJARAAIAAAAHAAAAWAAAAAAyMDI2OjExOjE4IDE0OjMyOjA1ACswMzowMAAAAAQAAQACAAAAAlMAAAAAAgAFAAAAAwAAAJYAAwACAAAAAkUAAAAABAAFAAAAAwAAAK4AAAAAAAAAAQAAAAEAAAARAAAAAQAAAxUAAAAZAAAAJAAAAAEAAAAxAAAAAQAAAdcAAAAZ/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgACAAIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Ar0UUUAf/2Q=="), (c) => c.charCodeAt(0));

describe("photo time and place from the phone's own data", () => {
  it("reads the original time with its offset and the GPS point", () => {
    expect(readExif(withExif)).toEqual({ takenAt: "2026-11-18T14:32:05+03:00", latitude: -1.2921, longitude: 36.8219 });
  });

  it("gives nothing for a photo without that data, or for something that is not a JPEG", () => {
    expect(readExif(Uint8Array.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x02]))).toEqual({});
    expect(readExif(new TextEncoder().encode("hello"))).toEqual({});
    expect(readExif(withExif.slice(0, 40))).toEqual({});
  });

  it("turns the camera's time into an instant, using the country's offset when the phone wrote none", () => {
    expect(exifInstant("2026-11-18T14:32:05+03:00", 0)).toBe("2026-11-18T11:32:05.000Z");
    expect(exifInstant("2026-11-18T14:32:05", 3)).toBe("2026-11-18T11:32:05.000Z");
    expect(exifInstant("2026-11-18T14:32:05", -1)).toBe("2026-11-18T15:32:05.000Z");
    expect(exifInstant("2026-11-18T14:32:05", 5.5)).toBe("2026-11-18T09:02:05.000Z");
  });

  it("stamps when, where and which claim, in the place's own time", () => {
    const text = stampText({ when: new Date("2026-11-18T11:32:05Z"), timeZone: "Africa/Nairobi", latitude: -1.2921, longitude: 36.8219, accuracy: 12.4, reference: "CLM-1" });
    expect(text).toMatch(/^18\/11\/26 14:32:05 /);
    expect(text).toContain("-1.29210, 36.82190 ±12 m");
    expect(text).toContain("CLM-1");
    expect(stampText({ when: new Date("2026-11-18T11:32:05Z"), timeZone: "Africa/Lagos" })).toMatch(/^18\/11\/26 12:32:05 .*no location$/);
    expect(mapPinUrl(-1.2921, 36.8219)).toBe("https://www.openstreetmap.org/?mlat=-1.2921&mlon=36.8219#map=18/-1.2921/36.8219");
  });
});
