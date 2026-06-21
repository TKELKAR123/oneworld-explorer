"use client";

import type { MapStyleMode, RouteAnalysis, TravelClass } from "@oneworld-explorer/core";
import { ExploreProvider } from "../../lib/explore/ExploreProvider";
import type { PlannerPhase } from "../../lib/planner/planner-phase";
import { globeMinHeight } from "../../lib/planner/planner-phase";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import { GlobeExplorer, type GlobeExplorerProps } from "../globe/GlobeExplorer";
import { ExploreToolbar } from "./ExploreToolbar";
import { NextHopsPanel } from "./NextHopsPanel";

export interface ExploreColumnProps extends Omit<GlobeExplorerProps, "hideDestinationsPanel"> {
  plannerPhase: PlannerPhase;
}

function ExploreColumnInner({
  plannerPhase: phase,
  continentFilter,
  onContinentFilterChange,
  chainMode = true,
  onChainModeChange,
  mapStyleMode,
  onMapStyleModeChange,
  globeFullscreen,
  onGlobeFullscreenChange,
  zoom = 1,
  onZoomChange,
  onAirportClick,
  onAddDestination,
  ...globeProps
}: ExploreColumnProps) {
  const minH = globeMinHeight(phase);

  return (
    <div className="flex flex-col gap-3" data-testid="explore-column">
      {!globeFullscreen && (
        <ExploreToolbar
          chainMode={chainMode}
          onChainModeChange={onChainModeChange ?? (() => {})}
          mapStyleMode={mapStyleMode}
          onMapStyleModeChange={onMapStyleModeChange}
          zoom={zoom}
          onZoomChange={onZoomChange ?? (() => {})}
          onExpand={() => onGlobeFullscreenChange(true)}
          onSearchSelect={onAirportClick}
        />
      )}

      <GlobeExplorer
        {...globeProps}
        continentFilter={continentFilter}
        onContinentFilterChange={onContinentFilterChange}
        chainMode={chainMode}
        onChainModeChange={onChainModeChange}
        mapStyleMode={mapStyleMode}
        onMapStyleModeChange={onMapStyleModeChange}
        globeFullscreen={globeFullscreen}
        onGlobeFullscreenChange={onGlobeFullscreenChange}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onAirportClick={onAirportClick}
        onAddDestination={onAddDestination}
        hideChrome
        hideDestinationsPanel
        minGlobeHeight={minH}
        useExploreContext
      />

      {!globeFullscreen && (
        <NextHopsPanel
          chainMode={chainMode}
          continentFilter={continentFilter}
          onContinentFilterChange={onContinentFilterChange}
          onAdd={onAddDestination}
          onReanchor={onAirportClick}
        />
      )}
    </div>
  );
}

export function ExploreColumn(props: ExploreColumnProps) {
  const analysis = props.currentAnalysis ?? null;
  return (
    <ExploreProvider
      anchorIata={props.exploreAnchorIata}
      stops={props.stops}
      legTypes={props.legTypes}
      travelClass={props.travelClass}
      currentAnalysis={analysis}
      continentFilter={props.continentFilter}
    >
      <ExploreColumnInner {...props} />
    </ExploreProvider>
  );
}
