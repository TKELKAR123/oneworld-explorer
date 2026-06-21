import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FLIGHTSFROM_WEEKLY_SOURCE,
  parseJontyRoutes,
  type JontyAirportEntry,
} from "../src/jonty-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const samplePath = join(repoRoot, "data/fixtures/jonty-routes-sample.json");

const ELIGIBLE = new Set([
  "AA",
  "AS",
  "AT",
  "AY",
  "BA",
  "CX",
  "FJ",
  "IB",
  "JL",
  "MH",
  "NU",
  "QF",
  "QR",
  "RJ",
  "UL",
  "WY",
]);

function loadSample(): Record<string, JontyAirportEntry> {
  return JSON.parse(readFileSync(samplePath, "utf-8")) as Record<string, JontyAirportEntry>;
}

describe("parseJontyRoutes", () => {
  it("filters non-eligible carriers (DL on LHR-JFK)", () => {
    const { pairs } = parseJontyRoutes(loadSample(), ELIGIBLE);
    const lhrJfk = pairs.filter((p) => p.from === "LHR" && p.to === "JFK");
    expect(lhrJfk.map((p) => p.carrier).sort()).toEqual(["AA", "BA"]);
    expect(lhrJfk.every((p) => p.source === FLIGHTSFROM_WEEKLY_SOURCE)).toBe(true);
  });

  it("includes WY MCT-LHR and AT CMN-JFK", () => {
    const { pairs } = parseJontyRoutes(loadSample(), ELIGIBLE);
    expect(pairs.some((p) => p.carrier === "WY" && p.from === "MCT" && p.to === "LHR")).toBe(true);
    expect(pairs.some((p) => p.carrier === "AT" && p.from === "CMN" && p.to === "JFK")).toBe(true);
  });

  it("does not emit NRT-JFK (absent in sample)", () => {
    const { pairs } = parseJontyRoutes(loadSample(), ELIGIBLE);
    expect(pairs.some((p) => p.from === "NRT" && p.to === "JFK")).toBe(false);
  });

  it("dedupes identical from-to-carrier rows", () => {
    const data: Record<string, JontyAirportEntry> = {
      LHR: {
        iata: "LHR",
        routes: [
          {
            iata: "JFK",
            carriers: [{ iata: "BA" }, { iata: "BA" }],
          },
        ],
      },
    };
    const { pairs } = parseJontyRoutes(data, ELIGIBLE);
    expect(pairs.filter((p) => p.from === "LHR" && p.to === "JFK" && p.carrier === "BA")).toHaveLength(
      1,
    );
  });

  it("supports carrierFilter for future-member preview", () => {
    const data: Record<string, JontyAirportEntry> = {
      MNL: {
        iata: "MNL",
        routes: [
          {
            iata: "LAX",
            carriers: [{ iata: "PR" }, { iata: "AA" }],
          },
        ],
      },
    };
    const { pairs } = parseJontyRoutes(data, ELIGIBLE, {
      carrierFilter: new Set(["PR"]),
      source: "future-member-preview",
    });
    expect(pairs).toEqual([
      { carrier: "PR", from: "MNL", to: "LAX", source: "future-member-preview" },
    ]);
  });
});
