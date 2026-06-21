import { describe, expect, it } from "vitest";
import {
  insertStopAt,
  insertStopBeforeReturn,
  setReturnStop,
  type ItineraryState,
} from "../../apps/web/lib/itinerary-mutations";

function state(stops: string[]): ItineraryState {
  const legTypes = stops.length > 1 ? Array(stops.length - 1).fill("flight") as ("flight" | "surface")[] : [];
  return {
    stops,
    legTypes,
    legDetails: legTypes.map(() => ({})),
    stopIntents: stops.map(() => "unknown" as const),
  };
}

describe("setReturnStop", () => {
  it("appends return when only origin exists", () => {
    const next = setReturnStop(state(["OSL"]), "TOS");
    expect(next.stops).toEqual(["OSL", "TOS"]);
    expect(next.returnLocked).toBe(true);
  });

  it("fills empty last stop as return", () => {
    const next = setReturnStop(state(["OSL", ""]), "TOS");
    expect(next.stops).toEqual(["OSL", "TOS"]);
  });

  it("updates locked return without touching origin", () => {
    const next = setReturnStop(
      { ...state(["OSL", "TOS"]), returnLocked: true },
      "BGO",
    );
    expect(next.stops).toEqual(["OSL", "BGO"]);
    expect(next.stops[0]).toBe("OSL");
  });

  it("inserts before empty trailing stop", () => {
    const next = setReturnStop(state(["OSL", "DOH", ""]), "TOS");
    expect(next.stops).toEqual(["OSL", "DOH", "TOS"]);
  });
});

describe("insertStopBeforeReturn", () => {
  it("inserts empty stop before return when return locked", () => {
    const base = setReturnStop(state(["OSL"]), "TOS");
    const next = insertStopBeforeReturn(base);
    expect(next.stops).toEqual(["OSL", "", "TOS"]);
  });
});
