"use client";

import { useState } from "react";
import { useDestinations } from "../../hooks/useDestinations";
import { useDestinationImpacts } from "../../lib/globe/useDestinationImpacts";
import { ExploreDestinationsPanel } from "./ExploreDestinationsPanel";
import { GlobeExplorer, type GlobeExplorerProps } from "./GlobeExplorer";

/**
 * Dual-view: next-hops list (primary) beside the planning globe.
 * Enable with NEXT_PUBLIC_DUAL_VIEW_GLOBE=1 — see docs/architecture/dual-view-globe-spike.md.
 */
export function DualViewExplorer(props: GlobeExplorerProps) {
  const [hoverDest, setHoverDest] = useState<string | null>(null);
  const { data: destinations, loading: destLoading } = useDestinations(
    props.exploreAnchorIata,
    props.continentFilter,
  );

  const rawList = destinations?.destinations ?? [];
  const enrichedList = useDestinationImpacts(rawList, {
    stops: props.stops,
    legTypes: props.legTypes,
    anchorIata: props.exploreAnchorIata,
    travelClass: props.travelClass,
    currentAnalysis: props.currentAnalysis ?? null,
  });

  function handleDestinationPick(iata: string) {
    if (props.chainMode) {
      props.onAddDestination(iata);
    } else {
      props.onAirportClick(iata);
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid="dual-view-explorer">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,38%)_1fr]">
        {props.exploreAnchorIata ? (
          <ExploreDestinationsPanel
            anchorIata={props.exploreAnchorIata}
            destinations={enrichedList}
            total={destinations?.total ?? 0}
            truncated={destinations?.truncated ?? false}
            loading={destLoading}
            hoverDest={hoverDest}
            onHover={setHoverDest}
            onAdd={handleDestinationPick}
          />
        ) : (
          <div className="hidden rounded-lg border border-dashed border-surface-border bg-surface-card/30 p-4 text-center text-xs text-surface-muted lg:flex lg:items-center lg:justify-center">
            Search or click an airport to see next hops
          </div>
        )}
        <GlobeExplorer {...props} hideDestinationsPanel />
      </div>
    </div>
  );
}
