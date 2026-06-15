/**
 * Critical path — ship gate.
 * If any test here fails, the app is not usable for its core purpose.
 */
import { describe, expect, it } from "vitest";
import { GET } from "../../apps/web/app/api/airports/search/route.js";
import { POST } from "../../apps/web/app/api/validate/route.js";

const CLASSIC_RTW = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

/** SC-004: five intra-Asia segments exceeds continent budget */
const FIVE_ASIA_SEGMENTS = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "BKK" },
  { from: "BKK", to: "HKG" },
  { from: "HKG", to: "NRT" },
  { from: "NRT", to: "KUL" },
  { from: "KUL", to: "DEL" },
  { from: "DEL", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

describe("critical path — ship gate (API)", () => {
  it("validates a classic RTW as valid with LONE4 fare basis", async () => {
    const res = await POST(
      new Request("http://test/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelClass: "economy", segments: CLASSIC_RTW }),
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.rulesVersion).toBe("2026-02-27");
    expect(body.analysis?.suggestedFareBasis).toBe("LONE4");
    expect(body.issues.filter((i: { severity: string }) => i.severity === "error")).toEqual(
      [],
    );
  });

  it("rejects an invalid RTW with traceable ruleId", async () => {
    const res = await POST(
      new Request("http://test/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: [{ from: "JFK", to: "LHR" }] }),
      }),
    );
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.issues.some((i: { code: string }) => i.code.startsWith("R3015-"))).toBe(
      true,
    );
  });

  it("rejects SC-004 excessive intra-Asia segments with R3015-4h-continent-limits", async () => {
    const res = await POST(
      new Request("http://test/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelClass: "economy", segments: FIVE_ASIA_SEGMENTS }),
      }),
    );
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(
      body.issues.some((i: { code: string }) => i.code === "R3015-4h-continent-limits"),
    ).toBe(true);
  });

  it("returns structured error for unknown airport (no silent wrong continent)", async () => {
    const res = await POST(
      new Request("http://test/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: [{ from: "ZZZ", to: "JFK" }] }),
      }),
    );
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.issues.some((i: { code: string }) => i.code === "UNKNOWN_AIRPORT")).toBe(
      true,
    );
  });

  it("airport search returns results for autocomplete", async () => {
    const res = await GET(new Request("http://test/api/airports/search?q=JFK"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.airports[0]?.iata).toBe("JFK");
  });
});
