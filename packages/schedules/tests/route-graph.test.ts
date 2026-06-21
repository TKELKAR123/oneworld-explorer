import { describe, expect, it } from "vitest";
import {
  findHubConnections,
  listDirectDestinations,
  loadOpenFlightsRoutes,
  queryRouteNetwork,
} from "../src/route-graph.js";

describe("route-graph", () => {
  const routes = loadOpenFlightsRoutes();

  it("loads eligible route index", () => {
    expect(routes.length).toBeGreaterThan(1000);
  });

  it("finds direct carriers for LHR→JFK", () => {
    const result = queryRouteNetwork("LHR", "JFK", routes);
    expect(result.hasDirect).toBe(true);
    expect(result.directCarriers.length).toBeGreaterThan(0);
    expect(result.suggestedHubs).toEqual([]);
  });

  it("marks NRT→JFK inactive with planning hint", () => {
    const result = queryRouteNetwork("NRT", "JFK", routes);
    expect(result.hasDirect).toBe(false);
    expect(result.confidence).toBe("inactive");
    expect(result.planningHint).toMatch(/No recent nonstop/i);
  });

  it("suggests hubs for long haul without direct eligible route", () => {
    const hubs = findHubConnections(routes, "LHR", "SYD");
    expect(hubs.length).toBeGreaterThan(0);
    expect(hubs.some((h) => h.hub === "SIN" || h.hub === "DOH" || h.hub === "DXB")).toBe(true);
  });

  it("returns empty hubs for impossible pair", () => {
    const hubs = findHubConnections(routes, "XXX", "YYY");
    expect(hubs).toEqual([]);
  });

  it("queryRouteNetwork includes disclaimer and source", () => {
    const result = queryRouteNetwork("LHR", "SYD", routes);
    expect(result.source).toBe("flightsfrom-weekly");
    expect(result.disclaimer).toMatch(/FlightsFrom|weekly/i);
  });

  it("listDirectDestinations returns LHR from JFK", () => {
    const result = listDirectDestinations("JFK", routes, { limit: 100 });
    expect(result.destinations.some((d) => d.iata === "LHR")).toBe(true);
    expect(result.total).toBeGreaterThan(10);
  });

  it("listDirectDestinations respects limit and truncation", () => {
    const result = listDirectDestinations("JFK", routes, { limit: 5 });
    expect(result.destinations.length).toBeLessThanOrEqual(5);
    if (result.total > 5) expect(result.truncated).toBe(true);
  });

  it("listDirectDestinations returns empty for unknown airport", () => {
    const result = listDirectDestinations("XXX", routes);
    expect(result.destinations).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("listDirectDestinations omits inactive pairs such as NRT→JFK", () => {
    const result = listDirectDestinations("NRT", routes, { limit: 500 });
    expect(result.destinations.some((d) => d.iata === "JFK")).toBe(false);
  });
});
