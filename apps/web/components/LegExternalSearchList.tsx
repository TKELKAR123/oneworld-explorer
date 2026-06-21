"use client";

import type { TravelClass } from "@oneworld-explorer/core";
import { LegExternalSearch } from "./LegExternalSearch";
import { RouteNetworkChip } from "./RouteNetworkChip";

export interface LegExternalSearchListProps {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  travelClass: TravelClass;
}

export function LegExternalSearchList({
  stops,
  legTypes,
  travelClass,
}: LegExternalSearchListProps) {
  if (stops.length < 2) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-surface-border pt-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Find flights (external)</h3>
        <p className="text-caption">
          Search on Google Flights — then paste times into Schedule &amp; carriers below.
        </p>
      </div>
      {stops.slice(0, -1).map((from, i) => {
        const to = stops[i + 1]!;
        const isSurface = legTypes[i] === "surface";
        return (
          <div key={`leg-search-${i}-${from}-${to}`} className="space-y-1">
            <RouteNetworkChip from={from} to={to} legIndex={i} />
            <LegExternalSearch
              legIndex={i}
              from={from}
              to={to}
              isSurface={isSurface}
              travelClass={travelClass}
            />
          </div>
        );
      })}
    </div>
  );
}
