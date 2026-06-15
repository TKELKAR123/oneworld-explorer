import { describe, expect, it } from "vitest";
import {
  getCountryMapping,
  resolveAirport,
  searchAirports,
} from "../src/geography/resolve-airport.js";

describe("resolveAirport", () => {
  it("resolves known hub with continent and TC zone", () => {
    const jfk = resolveAirport("jfk");
    expect(jfk?.iata).toBe("JFK");
    expect(jfk?.continent).toBe("north-america");
    expect(jfk?.zone).toBe("TC1");
  });

  it("returns null for unknown IATA", () => {
    expect(resolveAirport("XXX")).toBeNull();
  });

  it("maps Hawaii airports to North America per Rule 3015", () => {
    const hnl = resolveAirport("HNL");
    expect(hnl?.continent).toBe("north-america");
    expect(hnl?.country).toBe("US");
  });

  it("splits Russia at Urals by airport longitude", () => {
    const svo = resolveAirport("SVO");
    const vvo = resolveAirport("VVO");
    expect(svo?.continent).toBe("europe-middle-east");
    expect(svo?.subZone).toBe("europe");
    expect(vvo?.continent).toBe("asia");
    expect(vvo?.subZone).toBeUndefined();
  });

  it("assigns Micronesia bloc per Qantas guide (Asia not SWP)", () => {
    // GU not in airports.json — country map still documents Asia
    const gu = getCountryMapping("GU");
    expect(gu?.explorerContinent).toBe("asia");
  });
});

describe("searchAirports", () => {
  it("finds by IATA prefix", () => {
    const hits = searchAirports("JFK", 5);
    expect(hits[0]?.iata).toBe("JFK");
  });

  it("finds by city name", () => {
    const hits = searchAirports("London", 5);
    expect(hits.some((a) => a.iata === "LHR")).toBe(true);
  });

  it("returns empty for blank query", () => {
    expect(searchAirports("")).toEqual([]);
  });
});
