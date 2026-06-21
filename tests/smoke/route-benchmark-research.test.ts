/**
 * Smoke: route benchmark corpus exists and route index scorer runs.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadOpenFlightsRoutes } from "../../packages/schedules/src/openflights-routes.js";

const repoRoot = join(import.meta.dirname, "../..");
const corpusPath = join(repoRoot, "data/fixtures/route-benchmark-corpus.json");

function benchmarkRecall(): number {
  const corpus = JSON.parse(readFileSync(corpusPath, "utf-8")) as Array<{
    carrier: string;
    from: string;
    to: string;
    expected: string;
  }>;
  const routes = loadOpenFlightsRoutes();
  const shouldAppear = corpus.filter((c) => c.expected === "should-appear");
  let hits = 0;
  for (const entry of shouldAppear) {
    const found = routes.some(
      (r) =>
        r.carrier === entry.carrier.toUpperCase() &&
        r.from === entry.from.toUpperCase() &&
        r.to === entry.to.toUpperCase() &&
        !r.inactive,
    );
    if (found) hits++;
  }
  return shouldAppear.length ? hits / shouldAppear.length : 0;
}

describe("route benchmark corpus", () => {
  it("loads 60-entry corpus with required categories", () => {
    expect(existsSync(corpusPath)).toBe(true);
    const corpus = JSON.parse(readFileSync(corpusPath, "utf-8")) as Array<{
      id: string;
      category: string;
      carrier: string;
      from: string;
      to: string;
      expected: string;
    }>;
    expect(corpus.length).toBeGreaterThanOrEqual(40);
    const categories = new Set(corpus.map((c) => c.category));
    expect(categories.has("known-inactive")).toBe(true);
    expect(categories.has("high-traffic-trunk")).toBe(true);
    expect(categories.has("affiliate-edge")).toBe(true);
    expect(categories.has("newer-members")).toBe(true);
  });

  it("route index has routes for scoring", () => {
    const routes = loadOpenFlightsRoutes();
    expect(routes.length).toBeGreaterThan(1000);
  });

  it("meets minimum should-appear recall on committed index", () => {
    expect(benchmarkRecall()).toBeGreaterThanOrEqual(0.9);
  });

  it("kiwi endpoint probe fixture documents 404", () => {
    const probePath = join(repoRoot, "tests/schedules/fixtures/kiwi-endpoint-probe.json");
    expect(existsSync(probePath)).toBe(true);
    const probe = JSON.parse(readFileSync(probePath, "utf-8")) as {
      results: Array<{ path: string; status: number }>;
    };
    const dataRoutes = probe.results.find((r) => r.path.includes("/data/routes"));
    expect(dataRoutes?.status).toBe(404);
  });
});
