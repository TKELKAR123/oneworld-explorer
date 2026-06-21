import { describe, expect, it } from "vitest";
import { validateRoute } from "@oneworld-explorer/core";
import { buildFlyerTalkExport } from "../../apps/web/lib/flyertalk-export";
import { CLASSIC_RTW, validateTicketReady } from "../helpers/route";

describe("buildFlyerTalkExport", () => {
  it("formats SC-001 classic RTW", () => {
    const result = validateRoute(CLASSIC_RTW);
    const text = buildFlyerTalkExport({
      stops: ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"],
      legDetails: [],
      stopIntents: Array(7).fill("unknown"),
      result,
      travelClass: "economy",
    });
    expect(text).toMatch(/LONE4/);
    expect(text).toMatch(/JFK-LHR-DXB-SIN-SYD-LAX-JFK/);
    expect(text).toMatch(/ticketReady|valid \(geometry\)/);
  });

  it("marks building phase for partial OSL route", () => {
    const result = validateRoute([{ from: "OSL", to: "DOH" }]);
    const text = buildFlyerTalkExport({
      stops: ["OSL", "DOH"],
      legDetails: [],
      stopIntents: ["unknown", "unknown"],
      result,
      travelClass: "economy",
    });
    expect(text).toMatch(/building/);
    expect(text).toMatch(/OSL-DOH/);
  });

  it("includes Asia ledger line for multi-stop Asia routing", () => {
    const segments = [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "BKK" },
      { from: "BKK", to: "HKG" },
      { from: "HKG", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ];
    const result = validateTicketReady(segments);
    const text = buildFlyerTalkExport({
      stops: [
        "JFK",
        "LHR",
        "DXB",
        "SIN",
        "BKK",
        "HKG",
        "NRT",
        "SYD",
        "LAX",
        "JFK",
      ],
      legDetails: [],
      stopIntents: Array(10).fill("unknown"),
      result,
      travelClass: "economy",
    });
    expect(text).toMatch(/Asia 3\/4/);
    expect(text).toMatch(/ticketReady/);
  });
});
