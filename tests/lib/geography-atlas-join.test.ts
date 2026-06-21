import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { GeographyAtlas } from "@oneworld-explorer/core";
import { GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST } from "@oneworld-explorer/core";

const atlasPath = join(process.cwd(), "data/geography-atlas.generated.json");

function loadAtlas(): GeographyAtlas {
  return JSON.parse(readFileSync(atlasPath, "utf8")) as GeographyAtlas;
}

describe("geography atlas join", () => {
  it("loads generated atlas with countries", () => {
    const atlas = loadAtlas();
    expect(atlas.countries.length).toBeGreaterThan(150);
    expect(atlas.rulesVersion).toBeTruthy();
  });

  it("maps US to north-america and TC1", () => {
    const us = loadAtlas().countries.find((c) => c.iso === "US");
    expect(us).toBeDefined();
    expect(us!.explorerContinent).toBe("north-america");
    expect(us!.trafficZone).toBe("TC1");
  });

  it("maps EG to europe-middle-east middle-east (not africa)", () => {
    const eg = loadAtlas().countries.find((c) => c.iso === "EG");
    expect(eg).toBeDefined();
    expect(eg!.explorerContinent).toBe("europe-middle-east");
    expect(eg!.explorerSubZone).toBe("middle-east");
    expect(eg!.trafficZone).toBe("TC2");
  });

  it("maps AU to south-west-pacific TC3", () => {
    const au = loadAtlas().countries.find((c) => c.iso === "AU");
    expect(au?.explorerContinent).toBe("south-west-pacific");
    expect(au?.trafficZone).toBe("TC3");
  });

  it("unmapped codes are allowlisted or few", () => {
    const atlas = loadAtlas();
    const disallowed = atlas.unmapped.filter(
      (u) => !u.startsWith("numeric:") && !GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST.has(u),
    );
    expect(disallowed.length).toBeLessThanOrEqual(5);
  });
});
