import { describe, expect, it } from "vitest";
import { greatCircleRadians, arcAltitudeRadians } from "../../apps/web/lib/globe/webgl-layers";

describe("webgl-layers arc altitude", () => {
  it("JFK→DEL arcs higher than JFK→LHR", () => {
    const short = greatCircleRadians(40.64, -73.78, 51.47, -0.46);
    const long = greatCircleRadians(40.64, -73.78, 28.56, 77.1);
    expect(long).toBeGreaterThan(short);
    expect(arcAltitudeRadians(long, "fan")).toBeGreaterThan(arcAltitudeRadians(short, "fan"));
  });

  it("leg altitude exceeds fan for same pair", () => {
    const dist = greatCircleRadians(40.64, -73.78, 51.47, -0.46);
    expect(arcAltitudeRadians(dist, "leg")).toBeGreaterThan(arcAltitudeRadians(dist, "fan"));
  });

  it("caps altitude at 0.42", () => {
    expect(arcAltitudeRadians(Math.PI, "leg")).toBeLessThanOrEqual(0.42);
  });
});
