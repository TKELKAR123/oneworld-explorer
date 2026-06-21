import { describe, expect, it } from "vitest";
import {
  applyGlobeControls,
  DEFAULT_GLOBE_CONTROLS,
  DEFAULT_MAX_FAN_ARCS,
  selectArcDestinations,
  selectImpactCandidates,
} from "../../apps/web/lib/globe/globe-controls";

describe("globe-controls", () => {
  it("applies polar angle limits", () => {
    const controls = {
      enableDamping: false,
      dampingFactor: 0,
      rotateSpeed: 1,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minDistance: 0,
      maxDistance: 1000,
    };
    applyGlobeControls(controls);
    expect(controls.minPolarAngle).toBe(DEFAULT_GLOBE_CONTROLS.minPolarAngle);
    expect(controls.maxPolarAngle).toBeCloseTo(Math.PI - 0.05);
    expect(controls.enableDamping).toBe(true);
  });

  it("caps fan arc destinations at 25 by carrier count", () => {
    const dests = Array.from({ length: 40 }, (_, i) => ({
      iata: `D${String(i).padStart(2, "0")}`,
      carrierCount: 40 - i,
    }));
    const capped = selectArcDestinations(dests);
    expect(capped).toHaveLength(DEFAULT_MAX_FAN_ARCS);
    expect(capped[0]!.carrierCount).toBe(40);
  });

  it("selectImpactCandidates matches arc selection", () => {
    const dests = [{ iata: "DOH", carrierCount: 5 }, { iata: "JFK", carrierCount: 3 }];
    expect(selectImpactCandidates(dests)).toEqual(selectArcDestinations(dests));
  });
});
