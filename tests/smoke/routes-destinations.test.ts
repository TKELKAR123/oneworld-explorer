/**
 * Smoke: GET /api/routes/destinations and /api/routes/graph/nodes
 */
import { describe, expect, it } from "vitest";
import { GET as getDestinations } from "../../apps/web/app/api/routes/destinations/route.js";
import { GET as getNodes } from "../../apps/web/app/api/routes/graph/nodes/route.js";

describe("smoke — GET /api/routes/graph/nodes", () => {
  it("returns network nodes with coordinates", async () => {
    const res = await getNodes();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThan(800);
    expect(body.nodes[0].lat).toBeDefined();
    expect(body.source).toBe("flightsfrom-weekly");
  });
});

describe("smoke — GET /api/routes/destinations", () => {
  it("returns LHR from JFK", async () => {
    const req = new Request("http://test/api/routes/destinations?from=JFK&limit=100");
    const res = await getDestinations(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.from).toBe("JFK");
    expect(body.destinations.some((d: { iata: string }) => d.iata === "LHR")).toBe(true);
  });

  it("returns 400 for missing from", async () => {
    const req = new Request("http://test/api/routes/destinations");
    const res = await getDestinations(req);
    expect(res.status).toBe(400);
  });
});
