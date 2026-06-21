import { describe, expect, it } from "vitest";
import type { CountryAtlasEntry, MapStyleMode } from "@oneworld-explorer/core";
import {
  styleCountryPolygon,
  styleGraticule,
  TC_COLORS,
} from "../../apps/web/lib/globe/map-style";

const sampleUs: CountryAtlasEntry = {
  iso: "US",
  name: "United States",
  explorerContinent: "north-america",
  explorerSubZone: null,
  trafficZone: "TC1",
  geometry: { type: "Polygon", coordinates: [] },
};

const sampleEg: CountryAtlasEntry = {
  iso: "EG",
  name: "Egypt",
  explorerContinent: "europe-middle-east",
  explorerSubZone: "middle-east",
  trafficZone: "TC2",
  geometry: { type: "Polygon", coordinates: [] },
};

describe("map-style", () => {
  const modes: MapStyleMode[] = ["continents", "tc-zones", "countries", "minimal"];

  it.each(modes)("returns polygon style for mode %s", (mode) => {
    const style = styleCountryPolygon(sampleUs, mode);
    expect(style.capColor).toMatch(/^rgba?\(/);
    expect(style.strokeColor).toBeTruthy();
    expect(style.altitude).toBeGreaterThan(0);
  });

  it("continents mode uses continent hue for US", () => {
    const style = styleCountryPolygon(sampleUs, "continents");
    expect(style.capColor).toContain("59"); // r channel of #3b82f6
  });

  it("tc-zones mode uses TC1 color for US", () => {
    const style = styleCountryPolygon(sampleUs, "tc-zones");
    expect(style.capColor).toContain("59"); // r channel of #3b82f6
  });

  it("tc-zones mode uses TC2 color for Egypt", () => {
    const style = styleCountryPolygon(sampleEg, "tc-zones");
    expect(style.capColor).toContain("99"); // r channel of #6366f1
  });

  it("minimal mode uses slate fill", () => {
    const style = styleCountryPolygon(sampleUs, "minimal");
    expect(style.capColor).toContain("30");
  });

  it("tc-zones mode uses TC3 color for eastern Russia", () => {
    const easternRu: CountryAtlasEntry = {
      iso: "RU",
      name: "Russia (east of Urals)",
      explorerContinent: "asia",
      explorerSubZone: null,
      trafficZone: "TC3",
      geometry: { type: "Polygon", coordinates: [] },
    };
    const style = styleCountryPolygon(easternRu, "tc-zones");
    expect(style.capColor).toContain("34"); // r channel of #22c55e
  });

  it("continents mode uses asia hue for eastern Russia", () => {
    const easternRu: CountryAtlasEntry = {
      iso: "RU",
      name: "Russia (east of Urals)",
      explorerContinent: "asia",
      explorerSubZone: null,
      trafficZone: "TC3",
      geometry: { type: "Polygon", coordinates: [] },
    };
    const style = styleCountryPolygon(easternRu, "continents");
    expect(style.capColor).toContain("34"); // r channel of #22c55e (asia green)
  });

  it("graticule hidden in minimal mode", () => {
    expect(styleGraticule("minimal").visible).toBe(false);
    expect(styleGraticule("continents").visible).toBe(true);
  });
});
