import { describe, expect, it } from "vitest";
import { resolveAirport } from "../../src/geography/resolve-airport.js";
import {
  crossesAtlantic,
  crossesPacific,
  isIntercontinental,
  zoneStep,
} from "../../src/rules/helpers/geometry.js";

describe("geometry helpers", () => {
  it("zoneStep follows eastbound TC order", () => {
    expect(zoneStep("TC1", "TC2")).toBe(1);
    expect(zoneStep("TC2", "TC3")).toBe(1);
    expect(zoneStep("TC3", "TC1")).toBe(1);
    expect(zoneStep("TC2", "TC1")).toBe(-1);
  });

  it("detects Atlantic and Pacific crossings", () => {
    expect(crossesAtlantic("TC1", "TC2")).toBe(true);
    expect(crossesPacific("TC1", "TC3")).toBe(true);
    expect(crossesAtlantic("TC2", "TC3")).toBe(false);
  });

  it("isIntercontinental uses Explorer continents", () => {
    const jfk = resolveAirport("JFK")!;
    const gru = resolveAirport("GRU")!;
    const lax = resolveAirport("LAX")!;
    expect(isIntercontinental(jfk, gru)).toBe(true);
    expect(isIntercontinental(jfk, lax)).toBe(false);
  });
});
