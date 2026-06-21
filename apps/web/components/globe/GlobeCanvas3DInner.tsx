"use client";

import { useEffect, useMemo, useRef } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import type { CountryAtlasEntry, MapStyleMode } from "@oneworld-explorer/core";
import type { GlobeExplorerProps, InspirationRoute } from "./GlobeExplorer";
import type { DestinationClient, NetworkNodeClient } from "../../lib/globe/explore-fan-style";
import { buildGraticule } from "../../lib/world-land";
import { styleCountryPolygon, styleGraticule } from "../../lib/globe/map-style";
import { applyGlobeControls } from "../../lib/globe/globe-controls";
import {
  altitudeToZoom,
  buildWebGlArcs,
  buildWebGlLabels,
  buildWebGlPoints,
  defaultGlobePov,
  zoomToAltitude,
  type WebGlArc,
  type WebGlPoint,
} from "../../lib/globe/webgl-layers";

type GlobeInstance = GlobeMethods;

export interface GlobeCanvas3DInnerProps {
  width: number;
  height: number;
  zoom: number;
  mapStyleMode: MapStyleMode;
  atlasCountries: CountryAtlasEntry[];
  onZoomChange?: (z: number) => void;
  exploreAnchorIata: string | null;
  destinations: DestinationClient[];
  hoverDest: string | null;
  networkNodes: NetworkNodeClient[];
  mapPoints: GlobeExplorerProps["mapPoints"];
  mapLegs: GlobeExplorerProps["mapLegs"];
  stops: string[];
  selectedStopIndex: number | null;
  chainMode: boolean;
  showSpine: boolean;
  showInspiration: boolean;
  inspirationRoutes: InspirationRoute[];
  legNetwork: GlobeExplorerProps["legNetwork"];
  legNetworkFeasibility?: GlobeExplorerProps["legNetworkFeasibility"];
  highlightedLegIndices: number[];
  focusedLegIndex: number | null;
  flyTo: { lat: number; lng: number; altitude?: number } | null;
  onAirportClick: (iata: string) => void;
  onDestinationPick: (iata: string) => void;
  onLegClick?: (legIndex: number) => void;
}

export default function GlobeCanvas3DInner({
  width,
  height,
  zoom,
  mapStyleMode,
  atlasCountries,
  onZoomChange,
  exploreAnchorIata,
  destinations,
  hoverDest,
  networkNodes,
  mapPoints,
  mapLegs,
  stops,
  selectedStopIndex,
  chainMode,
  showSpine,
  showInspiration,
  inspirationRoutes,
  legNetwork,
  legNetworkFeasibility,
  highlightedLegIndices,
  focusedLegIndex,
  flyTo,
  onAirportClick,
  onDestinationPick,
  onLegClick,
}: GlobeCanvas3DInnerProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const syncingZoomRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const anchorNode = exploreAnchorIata
    ? networkNodes.find((n) => n.iata === exploreAnchorIata) ?? null
    : null;

  const graticulePaths = useMemo(() => {
    const graticuleStyle = styleGraticule(mapStyleMode);
    if (!graticuleStyle.visible || zoom < 1.1) return [];
    return buildGraticule(30).map((line, i) => ({
      id: i,
      coords: line.map(([lng, lat]) => [lat, lng] as [number, number]),
      color: graticuleStyle.color,
    }));
  }, [mapStyleMode, zoom]);

  const arcs = useMemo(
    () =>
      buildWebGlArcs({
        anchorNode,
        destinations,
        mapLegs,
        hoverDest,
        showSpine,
        showInspiration,
        inspirationRoutes,
        networkNodes,
        legNetworkFeasibility,
        highlightedLegIndices,
        focusedLegIndex,
        legNetwork,
        mapPoints,
      }),
    [
      anchorNode,
      destinations,
      mapLegs,
      hoverDest,
      showSpine,
      showInspiration,
      inspirationRoutes,
      networkNodes,
      legNetworkFeasibility,
      highlightedLegIndices,
      focusedLegIndex,
      legNetwork,
      mapPoints,
    ],
  );

  const points = useMemo(
    () =>
      buildWebGlPoints({
        networkNodes,
        mapPoints,
        stops,
        exploreAnchorIata,
        chainMode,
        selectedStopIndex,
      }),
    [networkNodes, mapPoints, stops, exploreAnchorIata, chainMode, selectedStopIndex],
  );

  const labels = useMemo(() => buildWebGlLabels(points), [points]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (!onZoomChange) return;
      const factor = e.shiftKey ? 0.008 : 0.004;
      onZoomChange(Math.max(0.6, Math.min(2.5, zoom - e.deltaY * factor)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onZoomChange, zoom]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    syncingZoomRef.current = true;
    const pov = globe.pointOfView();
    const targetAlt = zoomToAltitude(zoom);
    if (Math.abs(pov.altitude - targetAlt) > 0.02) {
      globe.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: targetAlt }, 200);
    }
    const t = setTimeout(() => {
      syncingZoomRef.current = false;
    }, 300);
    return () => clearTimeout(t);
  }, [zoom]);

  useEffect(() => {
    if (!flyTo || !globeRef.current) return;
    syncingZoomRef.current = true;
    const pov = globeRef.current.pointOfView();
    globeRef.current.pointOfView(
      {
        lat: flyTo.lat,
        lng: flyTo.lng,
        altitude: flyTo.altitude ?? pov.altitude ?? zoomToAltitude(zoom),
      },
      800,
    );
    const t = setTimeout(() => {
      syncingZoomRef.current = false;
    }, 900);
    return () => clearTimeout(t);
  }, [flyTo, zoom]);

  function handleGlobeReady(globe: GlobeInstance) {
    globeRef.current = globe;
    const pov = defaultGlobePov(exploreAnchorIata, networkNodes);
    globe.pointOfView({ ...pov, altitude: zoomToAltitude(zoom) }, 0);
    const controls = globe.controls();
    applyGlobeControls(controls);
    controls.addEventListener("change", () => {
      if (syncingZoomRef.current || !onZoomChange) return;
      const next = globe.pointOfView();
      onZoomChange(altitudeToZoom(next.altitude));
      const el = containerRef.current;
      if (el) el.dataset.globePovLat = String(next.lat);
    });
    const el = containerRef.current;
    if (el) el.dataset.globePovLat = String(pov.lat);
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ width, height, overscrollBehavior: "contain" }}
      data-testid="globe-canvas"
      role="img"
      aria-label="3D planning globe — drag to rotate; scroll to zoom; click airports and routes"
    >
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        showGlobe
        backgroundColor="rgba(5,8,16,1)"
        showAtmosphere={mapStyleMode !== "minimal"}
        atmosphereColor="#475569"
        atmosphereAltitude={0.12}
        polygonsData={atlasCountries}
        polygonGeoJsonGeometry="geometry"
        polygonCapColor={(d: object) =>
          styleCountryPolygon(d as CountryAtlasEntry, mapStyleMode).capColor
        }
        polygonSideColor={(d: object) =>
          styleCountryPolygon(d as CountryAtlasEntry, mapStyleMode).sideColor
        }
        polygonStrokeColor={(d: object) =>
          styleCountryPolygon(d as CountryAtlasEntry, mapStyleMode).strokeColor
        }
        polygonAltitude={(d: object) =>
          styleCountryPolygon(d as CountryAtlasEntry, mapStyleMode).altitude
        }
        pathsData={graticulePaths}
        pathPoints="coords"
        pathPointLat={(p: [number, number]) => p[0]}
        pathPointLng={(p: [number, number]) => p[1]}
        pathColor={(d: object) => (d as { color: string }).color}
        pathStroke={0.5}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={(d: object) => (d as WebGlArc).color}
        arcAltitude={(d) => (d as WebGlArc).altitude}
        arcStroke={(d) => (d as WebGlArc).stroke}
        arcDashLength={(d) => (d as WebGlArc).dashLength ?? 1}
        arcDashGap={(d) => (d as WebGlArc).dashGap ?? 0}
        arcDashAnimateTime={(d) => ((d as WebGlArc).dashLength ? 4000 : 0)}
        onArcClick={(arc) => {
          const a = arc as WebGlArc;
          if (a.kind === "fan" && a.iata) onDestinationPick(a.iata);
          if (a.kind === "leg" && a.legIndex != null) onLegClick?.(a.legIndex);
        }}
        arcLabel={(d) => {
          const a = d as WebGlArc;
          return a.kind === "fan" ? a.iata ?? "" : "";
        }}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => (d as WebGlPoint).color}
        pointRadius={(d) => (d as WebGlPoint).size}
        pointAltitude="altitude"
        onPointClick={(pt) => onAirportClick((pt as WebGlPoint).iata)}
        labelsData={labels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize="size"
        labelColor="color"
        labelAltitude={0.02}
        labelDotRadius={0.25}
        labelResolution={2}
        onGlobeReady={() => {
          const globe = globeRef.current;
          if (!globe) return;
          handleGlobeReady(globe);
        }}
      />
    </div>
  );
}
