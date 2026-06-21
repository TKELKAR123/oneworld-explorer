import { describe, expect, it } from "vitest";
import { parseRoute } from "../../src/parse-route.js";
import {
  countDeclaredStopovers,
  hasDeclaredStopIntents,
} from "../../src/rules/helpers/stop-intent.js";

describe("stop-intent helpers", () => {
  const stops = ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"];
  const { itinerary } = parseRoute(
    stops.slice(0, -1).map((from, i) => ({ from, to: stops[i + 1]! })),
  );

  it("hasDeclaredStopIntents is false when all unknown", () => {
    expect(hasDeclaredStopIntents(stops.map(() => "unknown"))).toBe(false);
  });

  it("hasDeclaredStopIntents is true when stopover marked", () => {
    const intents = stops.map(() => "unknown" as const);
    intents[2] = "stopover";
    expect(hasDeclaredStopIntents(intents)).toBe(true);
  });

  it("countDeclaredStopovers ignores origin and destination", () => {
    if (!itinerary) throw new Error("missing itinerary");
    const intents = stops.map(() => "unknown" as const);
    intents[1] = "stopover";
    intents[5] = "stopover";
    const { total } = countDeclaredStopovers(itinerary, intents);
    expect(total).toBe(2);
  });

  it("connection intent does not count as stopover", () => {
    if (!itinerary) throw new Error("missing itinerary");
    const intents = stops.map(() => "connection" as const);
    const { total } = countDeclaredStopovers(itinerary, intents);
    expect(total).toBe(0);
  });
});
