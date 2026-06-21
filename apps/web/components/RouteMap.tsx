"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  geoDistance,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from "d3-geo";
import type { Continent, RouteAnalysis } from "@oneworld-explorer/core";
import { continentColor } from "../lib/continent-labels";
import { buildGraticule, getWorldLand } from "../lib/world-land";
import type { LegFeasibility } from "../hooks/useRouteNetwork";
import { legFeasibilityStroke } from "../hooks/useRouteNetwork";

export interface MapPoint {
  iata: string;
  latitude: number;
  longitude: number;
  continent?: Continent;
}

export interface MapLeg {
  from: MapPoint;
  to: MapPoint;
  surface: boolean;
  crossesAtlantic?: boolean;
  crossesPacific?: boolean;
}

export interface RouteMapProps {
  points: MapPoint[];
  legs: MapLeg[];
  highlightedStopIndex?: number | null;
  highlightedLegIndices?: number[];
  invalidStopIndices?: Set<number>;
  legNetworkFeasibility?: LegFeasibility[];
  onLegClick?: (legIndex: number) => void;
}

const ARC_STEPS = 32;
const MIN_HEIGHT = 280;
const ASPECT = 1.25;

function buildArc(from: MapPoint, to: MapPoint): [number, number][] {
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

function arcMidpoint(from: MapPoint, to: MapPoint): [number, number] {
  const interpolate = geoInterpolate(
    [from.longitude, from.latitude],
    [to.longitude, to.latitude],
  );
  return interpolate(0.5);
}

function isVisible(projection: GeoProjection, lon: number, lat: number): boolean {
  const projected = projection([lon, lat]);
  if (!projected) return false;
  const rotate = projection.rotate();
  const center: [number, number] = [-rotate[0], -rotate[1]];
  const dist = geoDistance(center, [lon, lat]);
  return dist <= Math.PI / 2 + 0.05;
}

function bestProjection(
  points: MapPoint[],
  width: number,
  height: number,
  manualRotate: [number, number, number],
): GeoProjection {
  const baseLon = points.reduce((s, p) => s + p.longitude, 0) / points.length;
  const baseLat = points.reduce((s, p) => s + p.latitude, 0) / points.length;

  const candidates: [number, number, number][] = [
    manualRotate,
    [-baseLon, -baseLat, 0],
    [-baseLon + 30, -baseLat, 0],
    [-baseLon - 30, -baseLat, 0],
    [-baseLon, -baseLat + 20, 0],
    [-baseLon, -baseLat - 20, 0],
  ];

  let best = candidates[0]!;
  let bestVisible = -1;

  for (const rot of candidates) {
    const proj = geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(Math.min(width, height) / 2 - 28)
      .clipAngle(90)
      .rotate(rot);
    const visible = points.filter((p) => isVisible(proj, p.longitude, p.latitude)).length;
    if (visible > bestVisible) {
      bestVisible = visible;
      best = rot;
    }
  }

  return geoOrthographic()
    .translate([width / 2, height / 2])
    .scale(Math.min(width, height) / 2 - 28)
    .clipAngle(90)
    .rotate(best);
}

function computeAutoRotate(
  points: MapPoint[],
  width: number,
  height: number,
): [number, number, number] {
  if (points.length === 0) return [0, 0, 0];
  return bestProjection(points, width, height, [0, 0, 0]).rotate() as [
    number,
    number,
    number,
  ];
}

function combineRotation(
  base: [number, number, number],
  delta: [number, number, number],
): [number, number, number] {
  return [
    base[0] + delta[0],
    Math.max(-60, Math.min(60, base[1] + delta[1])),
    base[2] + delta[2],
  ];
}

function pointsSignature(points: MapPoint[]): string {
  return points.map((p) => `${p.iata}:${p.latitude}:${p.longitude}`).join("|");
}

function labelOffset(lon: number, lat: number): { dx: number; dy: number; anchor: string } {
  if (lat > 45) return { dx: 0, dy: -14, anchor: "middle" };
  if (lat < -45) return { dx: 0, dy: 16, anchor: "middle" };
  if (lon > 0) return { dx: 10, dy: 4, anchor: "start" };
  return { dx: -10, dy: 4, anchor: "end" };
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 520, height: 400 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(280, Math.floor(entry.contentRect.width));
      const height = Math.max(MIN_HEIGHT, Math.floor(width / ASPECT));
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export function RouteMap({
  points,
  legs,
  highlightedStopIndex = null,
  highlightedLegIndices = [],
  invalidStopIndices = new Set(),
  legNetworkFeasibility,
  onLegClick,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const signature = pointsSignature(points);
  const [userDelta, setUserDelta] = useState<[number, number, number]>([0, 0, 0]);
  const [userControlled, setUserControlled] = useState(false);
  const dragRef = useRef<{
    x: number;
    y: number;
    delta: [number, number, number];
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingDeltaRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    setUserDelta([0, 0, 0]);
    setUserControlled(false);
  }, [signature]);

  const autoRotate = useMemo(
    () => computeAutoRotate(points, width, height),
    [signature, width, height, points],
  );

  const activeRotate = userControlled
    ? combineRotation(autoRotate, userDelta)
    : autoRotate;

  const projection = useMemo(() => {
    return geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(Math.min(width, height) / 2 - 28)
      .clipAngle(90)
      .rotate(activeRotate);
  }, [width, height, activeRotate]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const land = useMemo(() => getWorldLand(), []);
  const graticule = useMemo(() => buildGraticule(30), []);
  const highlightLegSet = new Set(highlightedLegIndices);
  const globeR = Math.min(width, height) / 2 - 28;

  function flushDelta() {
    if (pendingDeltaRef.current) {
      setUserDelta(pendingDeltaRef.current);
      pendingDeltaRef.current = null;
    }
    rafRef.current = null;
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault();
    setUserControlled(true);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      delta: [...userDelta] as [number, number, number],
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    const sensitivity = 0.35;
    pendingDeltaRef.current = [
      dragRef.current.delta[0] + dx * sensitivity,
      dragRef.current.delta[1] - dy * sensitivity,
      dragRef.current.delta[2],
    ];
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(flushDelta);
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      flushDelta();
    }
  }

  function resetView() {
    setUserDelta([0, 0, 0]);
    setUserControlled(false);
  }

  if (points.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-surface-border bg-surface-card text-sm text-surface-muted"
      >
        Add stops to preview the route
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-surface-border bg-surface-card p-2"
    >
      <button
        type="button"
        onClick={resetView}
        className="absolute right-3 top-3 z-10 rounded-md border border-surface-border bg-surface-card/90 px-2 py-1 text-[10px] text-surface-muted hover:text-slate-200"
      >
        Reset view
      </button>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Route map — drag to rotate"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <clipPath id="globe-clip">
            <circle cx={width / 2} cy={height / 2} r={globeR} />
          </clipPath>
          <filter id="leg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={width / 2}
          cy={height / 2}
          r={globeR}
          fill="#0c1220"
          stroke="#2a3648"
          strokeWidth={1}
        />

        <g clipPath="url(#globe-clip)">
          {graticule.map((line, i) => {
            const d = pathGen({
              type: "LineString",
              coordinates: line,
            });
            if (!d) return null;
            return (
              <path
                key={`grid-${i}`}
                d={d}
                fill="none"
                stroke="#334155"
                strokeWidth={0.5}
                strokeOpacity={0.25}
              />
            );
          })}

          <path
            d={pathGen(land) ?? ""}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth={0.5}
          />

          {legs.map((leg, i) => {
            const arcCoords = buildArc(leg.from, leg.to);
            const d = pathGen({
              type: "LineString",
              coordinates: arcCoords,
            });
            if (!d) return null;

            const destContinent = leg.to.continent;
            const networkColor = legNetworkFeasibility?.[i]
              ? legFeasibilityStroke(legNetworkFeasibility[i]!)
              : null;
            const color =
              networkColor ??
              (destContinent ? continentColor(destContinent) : "#64748b");
            const highlighted = highlightLegSet.has(i);
            const dimmed = highlightedLegIndices.length > 0 && !highlighted;

            return (
              <g
                key={`leg-${i}`}
                style={onLegClick ? { cursor: "pointer" } : undefined}
                onClick={() => onLegClick?.(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onLegClick?.(i);
                }}
                role={onLegClick ? "button" : undefined}
                tabIndex={onLegClick ? 0 : undefined}
              >
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={highlighted ? 3 : 2}
                  strokeOpacity={dimmed ? 0.2 : 0.9}
                  strokeDasharray={leg.surface ? "6 4" : undefined}
                  filter={highlighted ? "url(#leg-glow)" : undefined}
                />
                {leg.crossesAtlantic && (
                  <text
                    x={projection(arcMidpoint(leg.from, leg.to))?.[0] ?? 0}
                    y={projection(arcMidpoint(leg.from, leg.to))?.[1] ?? 0}
                    fill="#94a3b8"
                    fontSize={9}
                    textAnchor="middle"
                  >
                    Atlantic
                  </text>
                )}
                {leg.crossesPacific && (
                  <text
                    x={projection(arcMidpoint(leg.from, leg.to))?.[0] ?? 0}
                    y={(projection(arcMidpoint(leg.from, leg.to))?.[1] ?? 0) + 10}
                    fill="#94a3b8"
                    fontSize={9}
                    textAnchor="middle"
                  >
                    Pacific
                  </text>
                )}
              </g>
            );
          })}

          {points.map((pt, i) => {
            if (!isVisible(projection, pt.longitude, pt.latitude)) return null;
            const projected = projection([pt.longitude, pt.latitude]);
            if (!projected) return null;
            const [x, y] = projected;
            const highlighted = highlightedStopIndex === i;
            const dimmed = highlightedStopIndex !== null && highlightedStopIndex !== i;
            const invalid = invalidStopIndices.has(i);
            const fill = invalid
              ? "#ef4444"
              : pt.continent
                ? continentColor(pt.continent)
                : "#64748b";
            const { dx, dy, anchor } = labelOffset(pt.longitude, pt.latitude);

            return (
              <g key={`pt-${pt.iata}-${i}`} opacity={dimmed ? 0.35 : 1}>
                <circle
                  cx={x}
                  cy={y}
                  r={highlighted ? 7 : 5}
                  fill={fill}
                  stroke="#0f1419"
                  strokeWidth={1.5}
                />
                <text
                  x={x + dx}
                  y={y + dy}
                  fill="#e2e8f0"
                  fontSize={11}
                  fontWeight={600}
                  textAnchor={anchor as "start" | "middle" | "end"}
                >
                  {pt.iata}
                </text>
              </g>
            );
          })}
        </g>

        <g transform={`translate(12, ${height - 28})`}>
          <line x1={0} y1={0} x2={24} y2={0} stroke="#3b82f6" strokeWidth={2} />
          <text x={30} y={4} fill="#64748b" fontSize={10}>
            flight
          </text>
          <line
            x1={0}
            y1={14}
            x2={24}
            y2={14}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text x={30} y={18} fill="#64748b" fontSize={10}>
            surface
          </text>
        </g>
      </svg>
    </div>
  );
}

export function mapDataFromAnalysis(
  analysis: RouteAnalysis,
): { points: MapPoint[]; legs: MapLeg[] } {
  const points: MapPoint[] = [];
  const seen = new Set<string>();

  for (const seg of analysis.segments) {
    if (!seen.has(seg.from.iata)) {
      seen.add(seg.from.iata);
      if (seg.from.latitude != null && seg.from.longitude != null) {
        points.push({
          iata: seg.from.iata,
          latitude: seg.from.latitude,
          longitude: seg.from.longitude,
          continent: seg.from.continent,
        });
      }
    }
    if (!seen.has(seg.to.iata)) {
      seen.add(seg.to.iata);
      if (seg.to.latitude != null && seg.to.longitude != null) {
        points.push({
          iata: seg.to.iata,
          latitude: seg.to.latitude,
          longitude: seg.to.longitude,
          continent: seg.to.continent,
        });
      }
    }
  }

  const pointByIata = new Map(points.map((p) => [p.iata, p]));

  const legs: MapLeg[] = [];
  for (const seg of analysis.segments) {
    const from = pointByIata.get(seg.from.iata);
    const to = pointByIata.get(seg.to.iata);
    if (!from || !to) continue;
    legs.push({
      from,
      to,
      surface: seg.surface,
      crossesAtlantic: seg.crossesAtlantic,
      crossesPacific: seg.crossesPacific,
    });
  }

  return { points, legs };
}

export function kmBetween(a: MapPoint, b: MapPoint): number {
  return Math.round(
    geoDistance([a.longitude, a.latitude], [b.longitude, b.latitude]) * 6371,
  );
}
