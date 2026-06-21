import { geoDistance, geoInterpolate, type GeoProjection } from "d3-geo";

export interface LatLonPoint {
  latitude: number;
  longitude: number;
}

const ARC_STEPS = 32;

export function buildArc(from: LatLonPoint, to: LatLonPoint): [number, number][] {
  const start: [number, number] = [from.longitude, from.latitude];
  const end: [number, number] = [to.longitude, to.latitude];
  const interpolate = geoInterpolate(start, end);
  const coords: [number, number][] = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    const [lon, lat] = interpolate(i / ARC_STEPS);
    coords.push([lon, lat]);
  }
  return coords;
}

export function arcMidpoint(from: LatLonPoint, to: LatLonPoint): [number, number] {
  const interpolate = geoInterpolate(
    [from.longitude, from.latitude],
    [to.longitude, to.latitude],
  );
  return interpolate(0.5);
}

export function isVisible(projection: GeoProjection, lon: number, lat: number): boolean {
  const projected = projection([lon, lat]);
  if (!projected) return false;
  const rotate = projection.rotate();
  const center: [number, number] = [-rotate[0], -rotate[1]];
  const dist = geoDistance(center, [lon, lat]);
  return dist <= Math.PI / 2 + 0.05;
}

export function labelOffset(lon: number, lat: number): { dx: number; dy: number; anchor: string } {
  if (lat > 45) return { dx: 0, dy: -14, anchor: "middle" };
  if (lat < -45) return { dx: 0, dy: 16, anchor: "middle" };
  if (lon > 0) return { dx: 10, dy: 4, anchor: "start" };
  return { dx: -10, dy: 4, anchor: "end" };
}

export function rotateToPoint(lon: number, lat: number): [number, number, number] {
  return [-lon, -lat, 0];
}
