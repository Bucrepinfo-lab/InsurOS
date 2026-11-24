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

import { phoneTabs } from "../src/workspace/PhoneTabBar";
import { filterNavigationByPermissions } from "../src/navigation/permission-filter";

describe("phone tab bar (owner 24/11/26)", () => {
  const all = adminNavigation.flatMap((s) => s.items).filter((i) => !i.hidden);
  it("shows Home, Claims, Policies and Follow-ups when the role sees them all", () => {
    expect(phoneTabs(all).map((t) => t.label)).toEqual(["Home", "Claims", "Policies", "Follow-ups"]);
  });
  it("never shows a section the role cannot open, and fills the gap with one it can", () => {
    const tabs = phoneTabs(all.filter((i) => i.id !== "claims"));
    expect(tabs.map((t) => t.label)).toEqual(["Home", "Policies", "Follow-ups", "Messages"]);
  });
  it("only uses menu items the permission filter lets through", () => {
    const visible = filterNavigationByPermissions(adminNavigation, { permissions: [] }).flatMap((s) => s.items);
    const hrefs = new Set(visible.map((i) => i.href));
    for (const tab of phoneTabs(visible)) expect(hrefs.has(tab.href)).toBe(true);
  });
  it("draws every quick tab with a real icon", () => {
    for (const tab of phoneTabs(all)) expect(navIconName(tab.id)).not.toBe("dot");
  });
});
