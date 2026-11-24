import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adminNavigation } from "../src/navigation/navigation-config";

const appDir = join(__dirname, "..", "..", "..", "apps", "admin", "src", "app");
const PLACEHOLDERS = ["queueDemoRequest", "createDemoProduct"];

describe("pages in the menu have no do-nothing buttons (audit 24/11/26)", () => {
  it("never shows a 'not built yet' placeholder action on a visible page", () => {
    const visible = adminNavigation.flatMap((s) => s.items).filter((i) => !i.hidden);
    for (const item of visible) {
      const file = join(appDir, ...item.href.split("/").filter(Boolean), "page.tsx");
      expect(existsSync(file), item.href).toBe(true);
      const src = readFileSync(file, "utf8");
      for (const name of PLACEHOLDERS) expect(src.includes(name), `${item.href} uses ${name}`).toBe(false);
    }
  });
});
