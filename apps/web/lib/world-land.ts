import countries110m from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";

let cachedLand: FeatureCollection<Geometry> | null = null;

export function getWorldLand(): FeatureCollection<Geometry> {
  if (cachedLand) return cachedLand;
  const topology = countries110m as unknown as {
    type: "Topology";
    objects: { countries: unknown };
  };
  cachedLand = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;
  return cachedLand;
}

export function buildGraticule(step = 30): [number, number][][] {
  const lines: [number, number][][] = [];
  for (let lon = -180; lon <= 180; lon += step) {
    lines.push([
      [lon, -90],
      [lon, 90],
    ]);
  }
  for (let lat = -90; lat <= 90; lat += step) {
    lines.push([
      [-180, lat],
      [180, lat],
    ]);
  }
  return lines;
}
