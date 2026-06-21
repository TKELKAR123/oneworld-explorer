/**
 * Smoke: GET /api/routes/network — zero-API OpenFlights overlay.
 */
import { describe, expect, it } from "vitest";
import { GET } from "../../apps/web/app/api/routes/network/route.js";

describe("smoke — GET /api/routes/network", () => {
  it("returns direct carriers for LHR→JFK", async () => {
    const req = new Request("http://test/api/routes/network?from=LHR&to=JFK");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.from).toBe("LHR");
    expect(body.to).toBe("JFK");
    expect(body.hasDirect).toBe(true);
    expect(body.directCarriers.length).toBeGreaterThan(0);
    expect(body.source).toBe("flightsfrom-weekly");
  });

  it("returns hub suggestions when no direct route", async () => {
    const req = new Request("http://test/api/routes/network?from=LHR&to=SYD");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.suggestedHubs)).toBe(true);
  });

  it("returns 400 for missing params", async () => {
    const req = new Request("http://test/api/routes/network?from=LHR");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
