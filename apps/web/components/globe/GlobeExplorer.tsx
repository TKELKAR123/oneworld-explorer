"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MapStyleMode, RouteAnalysis, TravelClass } from "@oneworld-explorer/core";
import { useExploreOptional } from "../../lib/explore/ExploreProvider";
import { useDestinations } from "../../hooks/useDestinations";
import { useDestinationImpacts } from "../../lib/globe/useDestinationImpacts";
import { useGeographyAtlas } from "../../hooks/useGeographyAtlas";
import { useNetworkNodes } from "../../hooks/useNetworkNodes";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import type { MapLeg, MapPoint } from "../RouteMap";
import { zoomToAltitude } from "../../lib/globe/webgl-layers";
import { GlobeCanvas3D } from "./GlobeCanvas3D";
import { GlobeExplorerChrome } from "./GlobeExplorerChrome";
import { GlobeFullscreenOverlay } from "./GlobeFullscreenOverlay";
import { ExploreToolbar } from "../explore/ExploreToolbar";

export type GlobeMode = "plan" | "explore";

export interface InspirationRoute {
  id: string;
  label: string;
  stops: string[];
  points: Array<{ iata: string; lat: number; lon: number; continent?: string | null }>;
}

export interface GlobeExplorerProps {
  globeMode?: GlobeMode;
  onGlobeModeChange?: (mode: GlobeMode) => void;
  mapPoints: MapPoint[];
  mapLegs: MapLeg[];
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legNetwork: LegNetworkState[];
  legNetworkFeasibility?: LegNetworkState["feasibility"][];
  exploreAnchorIata: string | null;
  selectedStopIndex: number | null;
  continentFilter: string | null;
  onContinentFilterChange: (c: string | null) => void;
  showSpine: boolean;
  onShowSpineChange: (v: boolean) => void;
  showInspiration: boolean;
  onShowInspirationChange: (v: boolean) => void;
  inspirationRoutes: InspirationRoute[];
  onLoadInspiration?: (id: string) => void;
  continentCount?: number;
  onAirportClick: (iata: string) => void;
  onAddDestination: (iata: string) => void;
  onLegClick?: (legIndex: number) => void;
  highlightedLegIndices?: number[];
  focusedLegIndex?: number | null;
  chainMode?: boolean;
  onChainModeChange?: (v: boolean) => void;
  mapStyleMode: MapStyleMode;
  onMapStyleModeChange: (m: MapStyleMode) => void;
  globeFullscreen: boolean;
  onGlobeFullscreenChange: (v: boolean) => void;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  previewFutureMembers?: boolean;
  onPreviewFutureMembersChange?: (v: boolean) => void;
  travelClass: TravelClass;
  currentAnalysis?: RouteAnalysis | null;
  hideDestinationsPanel?: boolean;
  hideChrome?: boolean;
  minGlobeHeight?: number;
  useExploreContext?: boolean;
}

const DEFAULT_MIN_HEIGHT = 360;
const ASPECT = 1.1;

function useContainerSize(
  ref: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  minHeight: number,
) {
  const [size, setSize] = useState({ width: 520, height: minHeight });
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(280, Math.floor(entry.contentRect.width));
      const height = Math.max(minHeight, Math.floor(width / ASPECT));
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled, minHeight]);
  return size;
}

function useFullscreenSize(enabled: boolean) {
  const [size, setSize] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    if (!enabled) return;
    function update() {
      setSize({
        width: Math.max(640, window.innerWidth - 48),
        height: Math.max(480, window.innerHeight - 120),
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [enabled]);
  return size;
}

function GlobeExplorerBody(props: GlobeExplorerProps) {
  const {
    useExploreContext = false,
    minGlobeHeight = DEFAULT_MIN_HEIGHT,
    hideChrome = false,
  } = props;

  const exploreCtx = useExploreOptional();
  const { data: legacyDest, loading: legacyLoading } = useDestinations(
    useExploreContext ? null : props.exploreAnchorIata,
    props.continentFilter,
  );
  const legacyRaw = legacyDest?.destinations ?? [];
  const legacyEnriched = useDestinationImpacts(useExploreContext ? [] : legacyRaw, {
    stops: props.stops,
    legTypes: props.legTypes,
    anchorIata: props.exploreAnchorIata,
    travelClass: props.travelClass,
    currentAnalysis: props.currentAnalysis ?? null,
  });

  const destinations =
    useExploreContext && exploreCtx ? exploreCtx.destinations : legacyEnriched;
  const arcDestinations =
    useExploreContext && exploreCtx ? exploreCtx.arcDestinations : destinations;
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef, !props.globeFullscreen, minGlobeHeight);
  const fsSize = useFullscreenSize(props.globeFullscreen);
  const { nodes: networkNodes } = useNetworkNodes();
  const { atlas, loading: atlasLoading } = useGeographyAtlas();

  const [hoverDestLocal, setHoverDestLocal] = useState<string | null>(null);
  const hoverDest =
    useExploreContext && exploreCtx ? exploreCtx.hoverDest : hoverDestLocal;
  const setHoverDest =
    useExploreContext && exploreCtx ? exploreCtx.setHoverDest : setHoverDestLocal;

  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    altitude?: number;
  } | null>(null);
  const [internalZoom, setInternalZoom] = useState(1);
  const zoom = props.zoom ?? internalZoom;
  const setZoom = props.onZoomChange ?? setInternalZoom;

  const flyTo = useMemo(() => flyTarget, [flyTarget]);
  const atlasCountries = atlas?.countries ?? [];

  const chainMode = props.chainMode ?? true;

  function handleDestinationPick(iata: string) {
    if (chainMode) props.onAddDestination(iata);
    else props.onAirportClick(iata);
  }

  function handleResetView() {
    setZoom(1);
    const resetAltitude = zoomToAltitude(1);
    if (props.exploreAnchorIata) {
      const node = networkNodes.find((n) => n.iata === props.exploreAnchorIata);
      if (node) setFlyTarget({ lat: node.lat, lng: node.lon, altitude: resetAltitude });
    } else {
      setFlyTarget({ lat: 51.47, lng: -0.4543, altitude: resetAltitude });
    }
  }

  function handleSearchSelect(iata: string) {
    const node = networkNodes.find((n) => n.iata === iata);
    if (node) setFlyTarget({ lat: node.lat, lng: node.lon });
    props.onAirportClick(iata);
  }

  const canvasProps = {
    zoom,
    mapStyleMode: props.mapStyleMode,
    atlasCountries,
    onZoomChange: setZoom,
    exploreAnchorIata: props.exploreAnchorIata,
    destinations: arcDestinations,
    hoverDest,
    networkNodes,
    mapPoints: props.mapPoints,
    mapLegs: props.mapLegs,
    stops: props.stops,
    selectedStopIndex: props.selectedStopIndex,
    chainMode,
    showSpine: props.showSpine,
    showInspiration: props.showInspiration,
    inspirationRoutes: props.inspirationRoutes,
    legNetwork: props.legNetwork,
    legNetworkFeasibility: props.legNetworkFeasibility,
    highlightedLegIndices: props.highlightedLegIndices ?? [],
    focusedLegIndex: props.focusedLegIndex ?? null,
    flyTo,
    onAirportClick: props.onAirportClick,
    onDestinationPick: handleDestinationPick,
    onLegClick: props.onLegClick,
  };

  const chromeProps = {
    continentFilter: props.continentFilter,
    onContinentFilterChange: props.onContinentFilterChange,
    showSpine: props.showSpine,
    onShowSpineChange: props.onShowSpineChange,
    showInspiration: props.showInspiration,
    onShowInspirationChange: props.onShowInspirationChange,
    inspirationRoutes: props.inspirationRoutes,
    onLoadInspiration: props.onLoadInspiration,
    onSearchSelect: handleSearchSelect,
    exploreAnchorIata: props.exploreAnchorIata,
    continentCount: props.continentCount,
    chainMode,
    onChainModeChange: props.onChainModeChange,
    mapStyleMode: props.mapStyleMode,
    onMapStyleModeChange: props.onMapStyleModeChange,
    zoom,
    onZoomChange: setZoom,
    previewFutureMembers: props.previewFutureMembers,
    onPreviewFutureMembersChange: props.onPreviewFutureMembersChange,
  };

  function renderGlobeCanvas(w: number, h: number) {
    return (
      <>
        <GlobeCanvas3D {...canvasProps} width={w} height={h} />
        <div className="absolute left-0 top-0 z-20 h-0 w-0 overflow-visible">
          {destinations.map((d) => (
            <button
              key={`fan-hook-${d.iata}`}
              type="button"
              tabIndex={-1}
              aria-label={`Add ${d.iata} from explore fan`}
              data-testid={`explore-fan-arc-${d.iata}`}
              className="sr-only"
              onClick={() => handleDestinationPick(d.iata)}
            />
          ))}
          {props.mapLegs.map((_, i) => (
            <button
              key={`leg-hook-${i}`}
              type="button"
              tabIndex={-1}
              aria-label={`Select leg ${i + 1}`}
              data-testid={`globe-leg-arc-${i}`}
              className="sr-only"
              onClick={() => props.onLegClick?.(i)}
            />
          ))}
        </div>
      </>
    );
  }

  const fullscreenToolbar = hideChrome ? (
    <ExploreToolbar
      chainMode={chainMode}
      onChainModeChange={props.onChainModeChange ?? (() => {})}
      mapStyleMode={props.mapStyleMode}
      onMapStyleModeChange={props.onMapStyleModeChange}
      zoom={zoom}
      onZoomChange={setZoom}
      onExpand={() => props.onGlobeFullscreenChange(false)}
      onSearchSelect={handleSearchSelect}
    />
  ) : null;

  return (
    <div className="flex flex-col gap-3" data-testid="globe-explorer">
      {!props.globeFullscreen && !hideChrome && <GlobeExplorerChrome {...chromeProps} />}

      {!props.globeFullscreen && (
        <div
          ref={containerRef}
          className="relative w-full rounded-xl border border-surface-border bg-[#050810] p-2"
          style={{ overscrollBehavior: "contain", minHeight: minGlobeHeight }}
          data-testid={
            atlas && !atlasLoading && !legacyLoading
              ? "globe-atlas-ready"
              : "globe-atlas-loading"
          }
        >
          {!hideChrome && (
            <div className="absolute left-3 top-3 z-10 flex gap-1">
              <button
                type="button"
                onClick={() => props.onGlobeFullscreenChange(true)}
                data-testid="globe-fullscreen-expand"
                className="rounded-md border border-surface-border bg-surface-card/90 px-2 py-1 text-[10px] text-surface-muted hover:text-slate-200"
              >
                Expand
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleResetView}
            data-testid="globe-reset-view"
            className="absolute right-3 top-3 z-10 rounded-md border border-surface-border bg-surface-card/90 px-2 py-1 text-[10px] text-surface-muted hover:text-slate-200"
          >
            Reset view
          </button>
          {renderGlobeCanvas(width, height)}
          <p className="mt-1 text-center text-[10px] text-surface-muted/80">
            Drag to rotate · Scroll to zoom
          </p>
        </div>
      )}

      <GlobeFullscreenOverlay
        open={props.globeFullscreen}
        onClose={() => props.onGlobeFullscreenChange(false)}
      >
        {hideChrome ? fullscreenToolbar : <GlobeExplorerChrome {...chromeProps} />}
        <div
          className="relative mt-3 min-h-0 flex-1 rounded-xl border border-surface-border bg-[#050810] p-2"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <button
            type="button"
            onClick={handleResetView}
            data-testid="globe-reset-view"
            className="absolute right-3 top-3 z-10 rounded-md border border-surface-border bg-surface-card/90 px-2 py-1 text-[10px] text-surface-muted hover:text-slate-200"
          >
            Reset view
          </button>
          {renderGlobeCanvas(fsSize.width, fsSize.height)}
        </div>
      </GlobeFullscreenOverlay>
    </div>
  );
}

export function GlobeExplorer(props: GlobeExplorerProps) {
  return <GlobeExplorerBody {...props} />;
}
