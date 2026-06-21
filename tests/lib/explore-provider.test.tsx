import React, { type ReactNode } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ExploreProvider,
  useExplore,
} from "../../apps/web/lib/explore/ExploreProvider";

const mockUseDestinations = vi.fn();

vi.mock("../../apps/web/hooks/useDestinations", () => ({
  useDestinations: (...args: unknown[]) => mockUseDestinations(...args),
}));

function ExploreProbe(): ReactNode {
  const explore = useExplore();
  return (
    <div>
      <span data-testid="dest-count">{explore.destinations.length}</span>
      <span data-testid="arc-count">{explore.arcDestinations.length}</span>
    </div>
  );
}

function renderExplore(anchorIata = "LHR") {
  return render(
    <ExploreProvider
      anchorIata={anchorIata}
      stops={[]}
      legTypes={[]}
      travelClass="economy"
      currentAnalysis={null}
      continentFilter={null}
    >
      <ExploreProbe />
    </ExploreProvider>,
  );
}

describe("ExploreProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseDestinations.mockReturnValue({
      data: {
        destinations: Array.from({ length: 30 }, (_, i) => ({
          iata: `D${i}`,
          name: `Dest ${i}`,
          carrierCount: 30 - i,
          continent: "EU",
        })),
        total: 30,
        truncated: false,
      },
      loading: false,
      error: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses a single useDestinations subscription for the anchor", () => {
    renderExplore("LHR");
    expect(mockUseDestinations).toHaveBeenCalledWith("LHR", null);
    expect(
      mockUseDestinations.mock.calls.every((c) => c[0] === "LHR" && c[1] === null),
    ).toBe(true);
  });

  it("fires at most one preview-add batch after debounce settles", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ impacts: { D0: { ok: true } } }),
    } as Response);

    renderExplore("LHR");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    const previewCalls = fetchSpy.mock.calls.filter(([url]) =>
      String(url).includes("/api/itinerary/preview-add"),
    );
    expect(previewCalls).toHaveLength(1);

    const previewBody = JSON.parse(String(previewCalls[0]?.[1]?.body));
    expect(previewBody.candidates).toHaveLength(25);
    expect(previewBody.anchorIata).toBe("LHR");
  });

  it("does not preview-add when anchor is cleared", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ impacts: {} }),
    } as Response);

    const { rerender } = render(
      <ExploreProvider
        anchorIata={null}
        stops={[]}
        legTypes={[]}
        travelClass="economy"
        currentAnalysis={null}
        continentFilter={null}
      >
        <ExploreProbe />
      </ExploreProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(
      fetchSpy.mock.calls.filter(([url]) =>
        String(url).includes("/api/itinerary/preview-add"),
      ),
    ).toHaveLength(0);

    rerender(
      <ExploreProvider
        anchorIata="LHR"
        stops={[]}
        legTypes={[]}
        travelClass="economy"
        currentAnalysis={null}
        continentFilter={null}
      >
        <ExploreProbe />
      </ExploreProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(
      fetchSpy.mock.calls.filter(([url]) =>
        String(url).includes("/api/itinerary/preview-add"),
      ),
    ).toHaveLength(1);
  });
});
