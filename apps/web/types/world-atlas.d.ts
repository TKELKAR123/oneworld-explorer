declare module "world-atlas/countries-110m.json" {
  const value: unknown;
  export default value;
}

declare module "topojson-client" {
  import type { FeatureCollection, Geometry } from "geojson";

  export function feature(
    topology: { type: "Topology"; objects: Record<string, unknown> },
    object: unknown,
  ): FeatureCollection<Geometry>;
}
