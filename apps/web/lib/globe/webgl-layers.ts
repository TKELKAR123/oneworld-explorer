import type { Continent } from "@oneworld-explorer/core";
import type { LegFeasibility } from "../../hooks/useRouteNetwork";
import { legFeasibilityStroke } from "../../hooks/useRouteNetwork";
import { continentColor } from "../continent-labels";
import type { MapLeg, MapPoint } from "../../components/RouteMap";
import { fanArcOpacity } from "./explore-fan-style";
import type { DestinationClient, NetworkNodeClient } from "./explore-fan-style";
import type { InspirationRoute } from "../../components/globe/GlobeExplorer";
import { selectArcDestinations } from "./globe-controls";

export type WebGlArcKind = "fan" | "leg" | "spine" | "inspiration" | "hub";

export interface WebGlArc {
  kind: WebGlArcKind;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  altitude: number;
  stroke: number;
  dashLength?: number;
  dashGap?: number;
  iata?: string;
  legIndex?: number;
  testId?: string;
}

export interface WebGlPoint {
  iata: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
  label?: string;
  dimmed?: boolean;
}

export interface WebGlLabel {
  iata: string;
  lat: number;
  lng: number;
  text: string;
  size: number;
  color: string;
}

const HUB_SET = new Set(["JFK", "LHR", "SIN", "SYD", "DOH", "DXB", "HKG", "NRT"]);

function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function fanArcColorFromImpact(
  dest: DestinationClient,
  hovered: boolean,
  baseHex: string,
): string {
  const tier =
    dest.impact?.routing.tier === "blocked"
      ? "blocked"
      : dest.impact?.routing.tier === "warning" || dest.impact?.network.tier === "warning"
        ? "warning"
        : dest.impact?.routing.tier === "info"
          ? "info"
          : "ok";

  switch (tier) {
    case "blocked":
      return rgba("#ef4444", hovered ? 0.55 : 0.35);
    case "warning":
      return rgba("#f59e0b", hovered ? 0.9 : 0.65);
    case "info":
      return rgba(baseHex, hovered ? 0.85 : 0.55);
    default:
      return rgba(baseHex, hovered ? 1 : fanArcOpacity(dest.carrierCount));
  }
}

export function zoomToAltitude(zoom: number): number {
  return 2.2 / Math.max(0.6, Math.min(2.5, zoom));
}

export function altitudeToZoom(altitude: number): number {
  return Math.max(0.6, Math.min(2.5, 2.2 / Math.max(0.5, altitude)));
}

export function buildWebGlArcs(input: {
  anchorNode: NetworkNodeClient | null;
  destinations: DestinationClient[];
  mapLegs: MapLeg[];
  hoverDest: string | null;
  showSpine: boolean;
  showInspiration: boolean;
  inspirationRoutes: InspirationRoute[];
  networkNodes: NetworkNodeClient[];
  legNetworkFeasibility?: LegFeasibility[];
  highlightedLegIndices: number[];
  focusedLegIndex: number | null;
  legNetwork: Array<{ legIndex: number; from: string; to: string; feasibility: string; suggestedHubs: Array<{ hub: string }> }>;
  mapPoints: MapPoint[];
  maxFanArcs?: number;
}): WebGlArc[] {
  const arcs: WebGlArc[] = [];
  const highlightLegSet = new Set(
    input.focusedLegIndex !== null ? [input.focusedLegIndex] : input.highlightedLegIndices,
  );

  if (input.showSpine) {
    const byIata = new Map(input.networkNodes.map((n) => [n.iata, n]));
    const hubs = [...HUB_SET].map((h) => byIata.get(h)).filter(Boolean) as NetworkNodeClient[];
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        arcs.push({
          kind: "spine",
          startLat: hubs[i]!.lat,
          startLng: hubs[i]!.lon,
          endLat: hubs[j]!.lat,
          endLng: hubs[j]!.lon,
          color: "rgba(71,85,105,0.15)",
          altitude: 0.06,
          stroke: 0.4,
        });
      }
    }
  }

  if (input.showInspiration) {
    for (const route of input.inspirationRoutes) {
      for (let i = 0; i < route.points.length - 1; i++) {
        const from = route.points[i]!;
        const to = route.points[i + 1]!;
        arcs.push({
          kind: "inspiration",
          startLat: from.lat,
          startLng: from.lon,
          endLat: to.lat,
          endLng: to.lon,
          color: "rgba(167,139,250,0.35)",
          altitude: 0.08,
          stroke: 0.5,
          dashLength: 0.4,
          dashGap: 0.2,
        });
      }
    }
  }

  if (input.anchorNode && input.destinations.length) {
    const fanDests = selectArcDestinations(input.destinations, input.maxFanArcs);
    for (const dest of fanDests) {
      if (dest.lat == null || dest.lon == null) continue;
      const hovered = input.hoverDest === dest.iata;
      const base = dest.continent
        ? continentColor(dest.continent as Continent)
        : "#64748b";
      const opacity = hovered ? 1 : fanArcOpacity(dest.carrierCount);
      arcs.push({
        kind: "fan",
        startLat: input.anchorNode.lat,
        startLng: input.anchorNode.lon,
        endLat: dest.lat,
        endLng: dest.lon,
        color: dest.impact
          ? fanArcColorFromImpact(dest, hovered, base)
          : rgba(base, opacity),
        altitude: hovered ? 0.22 : 0.14,
        stroke: hovered ? 1.2 : dest.carrierCount >= 3 ? 0.9 : 0.6,
        iata: dest.iata,
        testId: `explore-fan-arc-${dest.iata}`,
      });
    }
  }

  input.mapLegs.forEach((leg, i) => {
    const networkColor = input.legNetworkFeasibility?.[i]
      ? legFeasibilityStroke(input.legNetworkFeasibility[i]!)
      : null;
    const base =
      networkColor ?? (leg.to.continent ? continentColor(leg.to.continent) : "#64748b");
    const highlighted = highlightLegSet.has(i);
    const dimmed = highlightLegSet.size > 0 && !highlighted;
    arcs.push({
      kind: "leg",
      startLat: leg.from.latitude,
      startLng: leg.from.longitude,
      endLat: leg.to.latitude,
      endLng: leg.to.longitude,
      color: rgba(base, dimmed ? 0.25 : 0.95),
      altitude: highlighted ? 0.32 : 0.24,
      stroke: highlighted ? 1.4 : 1,
      legIndex: i,
      dashLength: leg.surface ? 0.35 : undefined,
      dashGap: leg.surface ? 0.15 : undefined,
      testId: `globe-leg-arc-${i}`,
    });
  });

  for (const leg of input.legNetwork) {
    if (leg.feasibility === "direct" || leg.feasibility === "surface" || leg.feasibility === "loading") {
      continue;
    }
    if (!leg.suggestedHubs.length) continue;
    const fromPt = input.mapPoints.find((p) => p.iata === leg.from);
    const toPt = input.mapPoints.find((p) => p.iata === leg.to);
    if (!fromPt || !toPt) continue;
    for (const hub of leg.suggestedHubs.slice(0, 3)) {
      const hubNode = input.networkNodes.find((n) => n.iata === hub.hub);
      if (!hubNode) continue;
      arcs.push({
        kind: "hub",
        startLat: fromPt.latitude,
        startLng: fromPt.longitude,
        endLat: hubNode.lat,
        endLng: hubNode.lon,
        color: "rgba(245,158,11,0.45)",
        altitude: 0.12,
        stroke: 0.5,
        dashLength: 0.25,
        dashGap: 0.15,
      });
      arcs.push({
        kind: "hub",
        startLat: hubNode.lat,
        startLng: hubNode.lon,
        endLat: toPt.latitude,
        endLng: toPt.longitude,
        color: "rgba(245,158,11,0.45)",
        altitude: 0.12,
        stroke: 0.5,
        dashLength: 0.25,
        dashGap: 0.15,
      });
    }
  }

  return arcs;
}

export function buildWebGlPoints(input: {
  networkNodes: NetworkNodeClient[];
  mapPoints: MapPoint[];
  stops: string[];
  exploreAnchorIata: string | null;
  chainMode: boolean;
  selectedStopIndex: number | null;
}): WebGlPoint[] {
  const stopSet = new Set(input.stops.map((s) => s.toUpperCase()));
  const routeIatas = new Set(input.mapPoints.map((p) => p.iata));
  const points: WebGlPoint[] = [];

  if (input.chainMode) {
    for (const node of input.networkNodes) {
      const inRoute = stopSet.has(node.iata);
      const isAnchor = node.iata === input.exploreAnchorIata;
      if (!inRoute && !isAnchor && !routeIatas.has(node.iata)) {
        points.push({
          iata: node.iata,
          lat: node.lat,
          lng: node.lon,
          size: 0.15,
          color: node.continent ? rgba(continentColor(node.continent as Continent), 0.35) : "rgba(100,116,139,0.35)",
          altitude: 0.01,
          dimmed: true,
        });
      }
    }
  }

  for (const pt of input.mapPoints) {
    const idx = input.stops.findIndex((s) => s.toUpperCase() === pt.iata);
    const selected = input.selectedStopIndex === idx;
    const isAnchor = pt.iata === input.exploreAnchorIata;
    points.push({
      iata: pt.iata,
      lat: pt.latitude,
      lng: pt.longitude,
      size: selected ? 0.55 : isAnchor ? 0.5 : 0.4,
      color: pt.continent ? continentColor(pt.continent) : "#64748b",
      altitude: 0.02,
      label: pt.iata,
    });
  }

  if (input.exploreAnchorIata && !routeIatas.has(input.exploreAnchorIata)) {
    const anchor = input.networkNodes.find((n) => n.iata === input.exploreAnchorIata);
    if (anchor) {
      points.push({
        iata: anchor.iata,
        lat: anchor.lat,
        lng: anchor.lon,
        size: 0.5,
        color: "#ffffff",
        altitude: 0.025,
        label: anchor.iata,
      });
    }
  }

  return points;
}

export function buildWebGlLabels(points: WebGlPoint[]): WebGlLabel[] {
  return points
    .filter((p) => p.label)
    .map((p) => ({
      iata: p.iata,
      lat: p.lat,
      lng: p.lng,
      text: p.label!,
      size: 0.9,
      color: "rgba(226,232,240,0.95)",
    }));
}

export function defaultGlobePov(exploreAnchorIata: string | null, networkNodes: NetworkNodeClient[]) {
  if (exploreAnchorIata) {
    const node = networkNodes.find((n) => n.iata === exploreAnchorIata);
    if (node) return { lat: node.lat, lng: node.lon, altitude: 2.2 };
  }
  return { lat: 51.47, lng: -0.45, altitude: 2.2 };
}
