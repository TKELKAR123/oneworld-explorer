export interface GlobeControlsConfig {
  enableDamping: true;
  dampingFactor: number;
  rotateSpeed: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
}

export const DEFAULT_GLOBE_CONTROLS: GlobeControlsConfig = {
  enableDamping: true,
  dampingFactor: 0.08,
  rotateSpeed: 0.35,
  minPolarAngle: 0.05,
  maxPolarAngle: Math.PI - 0.05,
  minDistance: 120,
  maxDistance: 400,
};

export interface OrbitControlsLike {
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
}

export function applyGlobeControls(
  controls: OrbitControlsLike,
  cfg: GlobeControlsConfig = DEFAULT_GLOBE_CONTROLS,
): void {
  controls.enableDamping = cfg.enableDamping;
  controls.dampingFactor = cfg.dampingFactor;
  controls.rotateSpeed = cfg.rotateSpeed;
  controls.minPolarAngle = cfg.minPolarAngle;
  controls.maxPolarAngle = cfg.maxPolarAngle;
  controls.minDistance = cfg.minDistance;
  controls.maxDistance = cfg.maxDistance;
}

export const DEFAULT_MAX_FAN_ARCS = 25;

export function selectArcDestinations<T extends { carrierCount: number; iata: string }>(
  destinations: T[],
  maxFanArcs = DEFAULT_MAX_FAN_ARCS,
): T[] {
  return [...destinations]
    .sort((a, b) => b.carrierCount - a.carrierCount || a.iata.localeCompare(b.iata))
    .slice(0, maxFanArcs);
}

export function selectImpactCandidates<T extends { carrierCount: number; iata: string }>(
  destinations: T[],
  max = DEFAULT_MAX_FAN_ARCS,
): T[] {
  return selectArcDestinations(destinations, max);
}
