import type { Airport, Continent, TrafficZone } from "../../ontology/types.js";
import { CONTINENT_ZONE, EASTBOUND_ZONE_ORDER, HAWAII_AIRPORTS } from "../constants.js";

/** Eastbound step between zones: +1 forward, 0 same, -1 backtrack. */
export function zoneStep(from: TrafficZone, to: TrafficZone): number {
  if (from === to) return 0;
  const fi = EASTBOUND_ZONE_ORDER.indexOf(from);
  const ti = EASTBOUND_ZONE_ORDER.indexOf(to);
  const forward = (ti - fi + 3) % 3;
  return forward === 1 ? 1 : forward === 2 ? -1 : 0;
}

/** Validates §4(b): TC may only advance eastbound when the traffic zone changes. */
export function tcDirectionValid(tcSeq: TrafficZone[]): boolean {
  if (tcSeq.length === 0) return true;
  let lastIndex = EASTBOUND_ZONE_ORDER.indexOf(tcSeq[0]!);
  for (let i = 1; i < tcSeq.length; i++) {
    const tc = tcSeq[i]!;
    const idx = EASTBOUND_ZONE_ORDER.indexOf(tc);
    if (idx === lastIndex) continue;
    const step = (idx - lastIndex + 3) % 3;
    if (step !== 1) return false;
    lastIndex = idx;
  }
  return true;
}

export function crossesAtlantic(from: TrafficZone, to: TrafficZone): boolean {
  return (
    (from === "TC1" && to === "TC2") || (from === "TC2" && to === "TC1")
  );
}

export function crossesPacific(from: TrafficZone, to: TrafficZone): boolean {
  return (
    (from === "TC1" && to === "TC3") || (from === "TC3" && to === "TC1")
  );
}

export function segmentCrossesAtlantic(from: Airport, to: Airport): boolean {
  return crossesAtlantic(from.zone, to.zone);
}

export function segmentCrossesPacific(from: Airport, to: Airport): boolean {
  return crossesPacific(from.zone, to.zone);
}

export function isIntercontinental(from: Airport, to: Airport): boolean {
  return from.continent !== to.continent;
}

export function continentsAlongSegment(from: Airport, to: Airport): Continent[] {
  const set = new Set<Continent>([from.continent, to.continent]);
  return [...set];
}

export function continentZone(c: Continent): TrafficZone {
  return CONTINENT_ZONE[c];
}

export function isHawaii(airport: Airport): boolean {
  return airport.usState === "HI" || HAWAII_AIRPORTS.has(airport.iata);
}

export function isNorthAmericaNonHawaii(airport: Airport): boolean {
  return airport.continent === "north-america" && !isHawaii(airport);
}
