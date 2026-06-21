import { describe, expect, it } from "vitest";
import { validateRoute } from "@oneworld-explorer/core";

describe("R3015-0-three-continent-origin", () => {
  it("rejects 3-continent fare from South America", () => {
    const result = validateRoute([
      { from: "GRU", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "GRU" },
    ]);
    expect(
      result.issues.some((i) => i.code === "R3015-0-three-continent-origin"),
    ).toBe(true);
    expect(
      result.issues.find((i) => i.code === "R3015-0-three-continent-origin")?.pdfRef,
    ).toBeDefined();
  });
});
