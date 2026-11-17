import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..", "..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" || name === ".next" ? [] : tsxFiles(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

/**
 * Owner brief 17/11/26: "let there not be any dead buttons". A button must do
 * something: run a handler, submit a form, or be a link. This guards the two
 * shapes that crept in before (a bare <Button>Label</Button>, and a topbar
 * <button> with no handler).
 */
describe("no dead buttons", () => {
  const files = [...tsxFiles(join(root, "apps", "admin", "src")), ...tsxFiles(join(root, "packages", "ui", "src"))];

  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(60);
  });

  it("has no <Button> or <button> without a handler, a submit type or a form action", () => {
    const dead: string[] = [];
    for (const file of files) {
      if (file.endsWith(join("components", "Button.tsx"))) continue; // the component itself forwards its props
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/<(Button|button)\b([^>]*)>/g)) {
        const attrs = match[2] ?? "";
        const works = /onClick=|type=['"]submit['"]|formAction=|\{\.\.\./.test(attrs);
        if (!works) dead.push(`${file.slice(root.length + 1)}: <${match[1]}${attrs.replace(/\s+/g, " ").slice(0, 60)}>`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("keeps the topbar free of controls that go nowhere", () => {
    const bell = readFileSync(join(root, "packages/ui/src/workspace/NotificationBell.tsx"), "utf8");
    expect(bell).toContain("if (!href) return null");
    const search = readFileSync(join(root, "packages/ui/src/workspace/GlobalSearch.tsx"), "utf8");
    expect(search).toContain("matchSections");
    const tenant = readFileSync(join(root, "packages/ui/src/workspace/TenantSwitcher.tsx"), "utf8");
    expect(tenant).not.toContain("<button");
  });
});
