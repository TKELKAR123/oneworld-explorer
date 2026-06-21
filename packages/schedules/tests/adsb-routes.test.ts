import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isRouteInactive, routeConfidence } from "../src/openflights-routes.js";
import { queryRouteNetwork } from "../src/route-graph.js";

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../data/fixtures/adsb-routes-q1-2026.json",
);

describe("adsb observed routes fixture", () => {
  it("loads committed Q1 2026 slice", () => {
    const rows = JSON.parse(readFileSync(fixturePath, "utf-8")) as unknown[];
    expect(rows.length).toBeGreaterThan(0);
  });

  it("marks NRT-JFK inactive via overrides", () => {
    expect(isRouteInactive("NRT", "JFK")).toBe(true);
    const result = queryRouteNetwork("NRT", "JFK");
    expect(result.hasDirect).toBe(false);
    expect(result.confidence).toBe("inactive");
    expect(result.planningHint).toMatch(/No recent nonstop/i);
  });

  it("classifies observed vs historical confidence", () => {
    expect(routeConfidence("OSL", "LHR", ["BA"])).toBe("observed");
    expect(routeConfidence("NRT", "JFK", [])).toBe("inactive");
  });
});
