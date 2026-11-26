import { describe, expect, it } from "vitest";
import { SPEECH_LANGUAGES, SPEECH_WORDS, appendSpoken, speechLanguageFor, speechWord } from "../src/speech";

describe("speak instead of type", () => {
  it("offers only languages a phone can write down", () => {
    expect(SPEECH_LANGUAGES.map((l) => l.id)).toEqual(["sw-KE", "en-KE"]);
    expect(speechLanguageFor("sw")).toBe("sw-KE");
    expect(speechLanguageFor(undefined)).toBe("en-KE");
    expect(SPEECH_WORDS.gap.en).toMatch(/Kikuyu/);
  });

  it("has every word in English and Kiswahili", () => {
    for (const [key, w] of Object.entries(SPEECH_WORDS)) {
      expect(w.en.trim(), key).not.toBe("");
      expect(w.sw.trim(), key).not.toBe("");
      expect(w.sw, key).not.toBe(w.en);
    }
    expect(speechWord("tap", "sw")).toBe("Bonyeza uongee");
    expect(speechWord("tap", null)).toBe("Tap and speak");
  });

  it("adds spoken words within the box's limit", () => {
    expect(appendSpoken("", "  my car   was hit ", 100)).toBe("my car was hit");
    expect(appendSpoken("On Monday.", "at Thika road", 100)).toBe("On Monday. at Thika road");
    expect(appendSpoken("abc", " ", 100)).toBe("abc");
    expect(appendSpoken("abcdef", "ghij", 8)).toBe("abcdef g");
  });
});
