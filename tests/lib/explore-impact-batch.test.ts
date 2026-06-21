import { describe, expect, it } from "vitest";
import {
  selectImpactCandidates,
  DEFAULT_MAX_FAN_ARCS,
} from "../../apps/web/lib/globe/globe-controls";

describe("explore impact batch contract", () => {
  it("batches at most 25 candidates for preview-add", () => {
    const raw = Array.from({ length: 60 }, (_, i) => ({
      iata: `X${i}`,
      carrierCount: 60 - i,
    }));
    const batch = selectImpactCandidates(raw, DEFAULT_MAX_FAN_ARCS);
    expect(batch).toHaveLength(25);
    expect(batch[0]!.iata).toBe("X0");
  });

  it("returns all when under cap", () => {
    const raw = [{ iata: "DOH", carrierCount: 2 }];
    expect(selectImpactCandidates(raw)).toHaveLength(1);
  });
});
