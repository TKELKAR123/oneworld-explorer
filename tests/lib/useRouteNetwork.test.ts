import { describe, expect, it, vi } from "vitest";
import { fetchLegNetworks } from "../../apps/web/hooks/useRouteNetwork";

describe("fetchLegNetworks", () => {
  it("skips fetch for surface legs", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { legs } = await fetchLegNetworks(["JFK", "LHR"], ["surface"]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(legs[0]!.feasibility).toBe("surface");

    vi.unstubAllGlobals();
  });

  it("marks direct when API returns carriers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          directCarriers: ["BA", "AA"],
          hasDirect: true,
          suggestedHubs: [],
          disclaimer: "static",
        }),
      }),
    );

    const { legs, error } = await fetchLegNetworks(["JFK", "LHR"], ["flight"]);
    expect(error).toBe(false);
    expect(legs[0]!.feasibility).toBe("direct");
    expect(legs[0]!.directCarriers).toContain("BA");

    vi.unstubAllGlobals();
  });
});
