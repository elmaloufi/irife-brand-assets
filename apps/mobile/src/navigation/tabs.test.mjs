import assert from "node:assert/strict";
import test from "node:test";
import { tabs } from "./tabs.mjs";

test("IRIFE exposes exactly five primary destinations with ITRI centered", () => {
  assert.deepEqual(
    tabs.map(({ route }) => route),
    ["index", "discover", "guide", "map", "profile"]
  );
  assert.equal(tabs[2].isPortal, true);
  assert.equal(tabs[2].title, "ITRI");
});

test("every primary destination has a unique route and visible label", () => {
  const routes = tabs.map(({ route }) => route);
  const labels = tabs.map(({ label }) => label);

  assert.equal(new Set(routes).size, 5);
  assert.equal(new Set(labels).size, 5);
  assert.ok(labels.every((label) => label.trim().length > 0));
});

test("each primary destination defines distinct inactive and active icons", () => {
  for (const tab of tabs) {
    assert.ok(tab.icon.length > 0);
    assert.ok(tab.activeIcon.length > 0);
    assert.notEqual(tab.icon, tab.activeIcon);
  }
});

test("Requests remains outside the primary tab list and available as an account destination", () => {
  assert.equal(tabs.some(({ route }) => route === "requests"), false);
  assert.ok(tabs.some(({ route }) => route === "profile"));
});
