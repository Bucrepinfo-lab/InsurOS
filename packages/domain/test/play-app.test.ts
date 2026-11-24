import { describe, expect, it } from "vitest";
import { digitalPurchasesAllowed, isPlayAppSignal, shouldMarkPlayApp } from "../src";

describe("Play app (Google Play payments policy)", () => {
  it("recognises the Android app by its launch referrer or the remembered cookie", () => {
    expect(isPlayAppSignal({ referrer: "android-app://com.telpen.insuros/" })).toBe(true);
    expect(isPlayAppSignal({ cookie: "1" })).toBe(true);
    expect(isPlayAppSignal({ referrer: "https://getinsuros.com/" })).toBe(false);
    expect(isPlayAppSignal({})).toBe(false);
  });

  it("withholds My Cover Plus purchases inside the Play app only", () => {
    expect(digitalPurchasesAllowed({ referrer: "android-app://com.telpen.insuros/" })).toBe(false);
    expect(digitalPurchasesAllowed({ cookie: "1" })).toBe(false);
    expect(digitalPurchasesAllowed({ referrer: "https://wa.me/" })).toBe(true);
    expect(digitalPurchasesAllowed({ cookie: null, referrer: null })).toBe(true);
  });

  it("marks the session once, from the app's launch request", () => {
    expect(shouldMarkPlayApp("android-app://com.telpen.insuros/", null)).toBe(true);
    expect(shouldMarkPlayApp("android-app://com.telpen.insuros/", "1")).toBe(false);
    expect(shouldMarkPlayApp("https://getinsuros.com/", null)).toBe(false);
  });
});
