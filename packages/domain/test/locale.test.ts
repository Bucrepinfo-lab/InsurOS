import { describe, expect, it } from "vitest";
import { COUNTRY_CLOCKS, COUNTRY_PROFILES, CUSTOMER_TEXT, LANGUAGE_NAMES, clockFor, pickLanguage, t, utcOffsetHours } from "../src";

describe("languages and local time", () => {
  it("has every customer word in every language", () => {
    for (const [key, words] of Object.entries(CUSTOMER_TEXT)) {
      for (const lang of Object.keys(LANGUAGE_NAMES)) expect((words as Record<string, string>)[lang]?.trim(), `${key}/${lang}`).toBeTruthy();
    }
    expect(t("send", "sw")).toBe("Tuma");
  });

  it("gives every country with a profile its own clock", () => {
    for (const profile of COUNTRY_PROFILES) expect(COUNTRY_CLOCKS[profile.countryCode], profile.countryCode).toBeTruthy();
    expect(clockFor("ke").timeZone).toBe("Africa/Nairobi");
    expect(clockFor("ZZ").timeZone).toBe("Africa/Nairobi");
    expect(clockFor("TZ").languages[0]).toBe("sw");
  });

  it("works out each zone's offset", () => {
    const at = new Date("2026-11-18T12:00:00Z");
    expect(utcOffsetHours("Africa/Nairobi", at)).toBe(3);
    expect(utcOffsetHours("Africa/Lagos", at)).toBe(1);
    expect(utcOffsetHours("Asia/Kolkata", at)).toBe(5.5);
    expect(utcOffsetHours("America/New_York", at)).toBe(-5);
  });

  it("falls back to the country's first language", () => {
    expect(pickLanguage("sw")).toBe("sw");
    expect(pickLanguage("fr")).toBe("en");
    expect(pickLanguage(undefined, ["sw", "en"])).toBe("sw");
  });
});

describe("cover-ends line", () => {
  it("speaks Kiswahili and keeps English as it was", async () => {
    const { expiryStatus, expiryWords } = await import("../src");
    const now = new Date("2026-11-18T09:00:00Z");
    expect(expiryWords(expiryStatus("2026-11-28", now), "sw")).toBe("Inaisha baada ya siku 10");
    expect(expiryWords(expiryStatus("2026-11-08", now), "sw")).toBe("Iliisha siku 10 zilizopita");
    expect(expiryWords(expiryStatus(undefined, now), "sw")).toBe("Tarehe ya mwisho haijarekodiwa");
    expect(expiryWords(expiryStatus("2026-11-28", now), "en")).toBe(expiryStatus("2026-11-28", now).words);
  });
});

describe("today on each country's clock", () => {
  it("turns the day at local midnight", async () => {
    const { localDay } = await import("../src");
    const lateUtc = new Date("2026-11-18T22:30:00Z");
    expect(localDay(lateUtc)).toBe("2026-11-19");
    expect(localDay(lateUtc, "Africa/Lagos")).toBe("2026-11-18");
    expect(localDay(lateUtc, "America/New_York")).toBe("2026-11-18");
  });
});
