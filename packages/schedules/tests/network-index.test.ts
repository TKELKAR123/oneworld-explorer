import { describe, expect, it } from "vitest";
import {
  loadNetworkEdges,
  loadNetworkNodes,
  loadNetworkSpine,
} from "../src/network-index.js";

describe("network-index", () => {
  it("loads network nodes with coordinates", () => {
    const nodes = loadNetworkNodes();
    expect(nodes.length).toBeGreaterThan(800);
    expect(nodes.every((n) => n.lat != null && n.lon != null)).toBe(true);
  });

  it("loads unique edges", () => {
    const edges = loadNetworkEdges();
    expect(edges.length).toBeGreaterThan(2500);
    const keys = new Set(edges.map((e) => [e.from, e.to].sort().join("-")));
    expect(keys.size).toBe(edges.length);
  });

  it("loads spine pairs", () => {
    const spine = loadNetworkSpine();
    expect(spine.length).toBeGreaterThan(10);
  });
});
