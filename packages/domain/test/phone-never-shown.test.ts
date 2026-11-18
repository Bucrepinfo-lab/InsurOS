import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { maskPhone } from "../src";

const root = join(__dirname, "..", "..", "..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" || name === ".next" ? [] : tsxFiles(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

/**
 * Standing rule (Telpen Edu 30/10/26, adopted 18/11/26): the phone a person
 * signs in with is never shown in full on a screen — only masked, so a
 * shoulder-surfer or a screenshot cannot lift it.
 */
describe("the sign-in phone is never shown in full", () => {
  it("masks it", () => {
    expect(maskPhone("+254712345678")).toBe("+2547•••••678");
  });

  it("is never rendered or handed to the shell unmasked", () => {
    const files = [...tsxFiles(join(root, "apps", "admin", "src")), ...tsxFiles(join(root, "packages", "ui", "src"))];
    expect(files.length).toBeGreaterThan(60);
    const shown = /\{\s*(?:auth\.|state\.)?principal\.phone\s*\}|(?:email|label|title|name)\s*:\s*(?:auth\.|state\.)?principal\.phone\b(?!\s*\?\s*maskPhone)/;
    const offenders = files.filter((file) => shown.test(readFileSync(file, "utf8"))).map((file) => file.slice(root.length + 1));
    expect(offenders).toEqual([]);
  });
});
