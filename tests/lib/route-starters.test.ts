import { describe, expect, it } from "vitest";
import { getRouteStarter } from "../../apps/web/lib/route-starters";

describe("route-starters", () => {
  it("includes SC-001 classic RTW", () => {
    const s = getRouteStarter("SC-001");
    expect(s?.stops).toEqual(["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"]);
  });

  it("SC-079 westbound from Sydney", () => {
    const s = getRouteStarter("SC-079");
    expect(s?.stops[0]).toBe("SYD");
    expect(s?.stops.at(-1)).toBe("SYD");
  });

  it("has blank starter with empty stops", () => {
    const blank = getRouteStarter("blank");
    expect(blank).toBeDefined();
    expect(blank?.stops).toEqual([]);
    expect(blank?.legTypes).toEqual([]);
  });
});
