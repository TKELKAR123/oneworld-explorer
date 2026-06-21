import { describe, expect, it } from "vitest";
import { appendAfterAnchor } from "../../apps/web/lib/globe-chain-state";

describe("globe chain state", () => {
  it("appends after anchor without duplicating", () => {
    const { stops, legTypes, insertIndex } = appendAfterAnchor(
      ["OSL"],
      [],
      "DOH",
      "OSL",
    );
    expect(stops).toEqual(["OSL", "DOH"]);
    expect(legTypes).toEqual(["flight"]);
    expect(insertIndex).toBe(1);
  });

  it("returns existing index when stop already on route", () => {
    const { stops, insertIndex } = appendAfterAnchor(
      ["OSL", "DOH"],
      ["flight"],
      "DOH",
      "DOH",
    );
    expect(stops).toEqual(["OSL", "DOH"]);
    expect(insertIndex).toBe(1);
  });
});
