import { describe, expect, it } from "vitest";
import { adminNavigation } from "../src/navigation/navigation-config";
import { NAV_ICON_FOR, navIconName, navIconPaths } from "../src/navigation/nav-icons";
import { visibleTabs } from "../src/components/Tabs";

describe("menu icons (UI polish 24/11/26)", () => {
  it("gives every menu item a real icon, never the fallback dot", () => {
    for (const item of adminNavigation.flatMap((s) => s.items)) {
      expect(navIconName(item.id), item.id).not.toBe("dot");
    }
  });
  it("draws every mapped icon with at least one path", () => {
    for (const name of new Set(Object.values(NAV_ICON_FOR))) {
      expect(navIconPaths(name).length, name).toBeGreaterThan(0);
    }
  });
  it("falls back to the dot for an unknown id", () => {
    expect(navIconName("no-such-section")).toBe("dot");
  });
});

describe("record tabs keep no dead controls", () => {
  const items = [
    { id: "overview", label: "Overview", href: "/a" },
    { id: "fnol", label: "First notice" },
    { id: "settlement", label: "Settlement", href: "/a/settlement" }
  ];
  it("drops tabs with nowhere to go but keeps the current one", () => {
    expect(visibleTabs(items, "fnol").shown.map((t) => t.id)).toEqual(["overview", "fnol", "settlement"]);
    expect(visibleTabs(items, "overview").shown.map((t) => t.id)).toEqual(["overview", "settlement"]);
  });
  it("draws no strip when only the current tab is left", () => {
    expect(visibleTabs([{ id: "x", label: "X" }], "x").hasChoice).toBe(false);
  });
});
