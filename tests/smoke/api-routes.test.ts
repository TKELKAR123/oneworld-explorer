/**
 * Smoke: Next.js API routes are thin wrappers over packages/core.
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

describe("smoke — API route handlers", () => {
  it("POST /api/validate accepts classic RTW and returns valid + rulesVersion", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ travelClass: "economy", segments: CLASSIC_RTW }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.rulesVersion).toBe("2026-02-27");
    expect(body.analysis?.suggestedFareBasis).toBe("LONE4");
  });

  it("POST /api/validate rejects empty segments with 400", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/validate rejects invalid JSON with 400", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid JSON/i);
  });

  it("POST /api/validate flags invalid route with ruleId", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: [{ from: "JFK", to: "LHR" }] }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.issues.some((i: { code: string }) => i.code.startsWith("R3015-"))).toBe(
      true,
    );
  });

  it("POST /api/validate returns UNKNOWN_AIRPORT for bad IATA", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: [{ from: "ZZZ", to: "JFK" }] }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.issues.some((i: { code: string }) => i.code === "UNKNOWN_AIRPORT")).toBe(
      true,
    );
  });

  it("POST /api/validate attaches pdfRef and naturalLanguage on rule issues", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: [{ from: "JFK", to: "LHR" }] }),
    });
    const res = await POST(req);
    const body = await res.json();
    const ruleIssue = body.issues.find((i: { code: string }) =>
      i.code.startsWith("R3015-"),
    );
    expect(ruleIssue?.pdfRef).toBeTruthy();
    expect(ruleIssue?.naturalLanguage?.length).toBeGreaterThan(10);
  });

  it("POST /api/validate returns validationPhase for partial routes", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: [{ from: "OSL", to: "DOH" }],
        travelClass: "economy",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.validationPhase).toBe("building");
    expect(body.guidanceIssues?.length).toBeGreaterThan(0);
  });

  it("POST /api/validate accepts clientPhase ticketReady override", async () => {
    const req = new Request("http://test/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: [{ from: "JFK", to: "LHR" }, { from: "LHR", to: "JFK" }],
        clientPhase: "ticketReady",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.validationPhase).toBe("ticketReady");
    expect(body.issues.some((i: { code: string }) => i.code === "R3015-4h-segment-count")).toBe(
      true,
    );
  });

  it("GET /api/airports/search returns IATA matches", async () => {
    const req = new Request("http://test/api/airports/search?q=London&limit=5");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.airports.some((a: { iata: string }) => a.iata === "LHR")).toBe(true);
  });

  it("GET /api/airports/search returns empty for blank query", async () => {
    const req = new Request("http://test/api/airports/search?q=");
    const res = await GET(req);
    const body = await res.json();
    expect(body.airports).toEqual([]);
  });

  it("GET /api/airports/search respects limit cap", async () => {
    const req = new Request("http://test/api/airports/search?q=a&limit=2");
    const res = await GET(req);
    const body = await res.json();
    expect(body.airports.length).toBeLessThanOrEqual(2);
  });
});
