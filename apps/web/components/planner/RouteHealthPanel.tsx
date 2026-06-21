"use client";

import { useMemo, useState } from "react";
import type {
  ItinerarySuggestion,
  MapStyleMode,
  TicketContext,
  TravelClass,
  ValidationResult,
} from "@oneworld-explorer/core";
import { buildValidationChecklist } from "../../lib/validation-checklist";
import type { LegBookingDetails } from "../../lib/segment-booking";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import { ComplianceReport } from "../ComplianceReport";
import { GlobeExplorer, type GlobeMode, type InspirationRoute } from "../globe";
import { DualViewExplorer } from "../globe/DualViewExplorer";
import type { MapLeg, MapPoint } from "../RouteMap";
import { SegmentBudgets } from "../SegmentBudgets";
import { IssuesPanel } from "./IssuesPanel";
import { ValidationChecklist } from "./ValidationChecklist";

export interface RouteHealthPanelProps {
  result: ValidationResult | null;
  loading: boolean;
  travelClass: TravelClass;
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legDetails: LegBookingDetails[];
  legNetwork: LegNetworkState[];
  networkLoading: boolean;
  networkError: boolean;
  ticket: TicketContext;
  mapPoints: MapPoint[];
  mapLegs: MapLeg[];
  highlightedLegs: number[];
  focusedLegIndex: number | null;
  scheduleComplete: boolean;
  onHighlightLegs: (indices: number[]) => void;
  onFocusLeg: (index: number) => void;
  onChecklistRow: (row: { focusLegIndex?: number; id: string }) => void;
  onApplySuggestion?: (suggestion: ItinerarySuggestion) => void;
  onMapLegClick?: (legIndex: number) => void;
  globeMode: GlobeMode;
  onGlobeModeChange: (mode: GlobeMode) => void;
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
  onAirportClick: (iata: string) => void;
  onAddDestination: (iata: string) => void;
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
}

export function RouteHealthPanel({
  result,
  loading,
  travelClass,
  stops,
  legTypes,
  legDetails,
  legNetwork,
  networkLoading,
  networkError,
  ticket,
  mapPoints,
  mapLegs,
  highlightedLegs,
  focusedLegIndex,
  scheduleComplete,
  onHighlightLegs,
  onFocusLeg,
  onChecklistRow,
  onApplySuggestion,
  onMapLegClick,
  globeMode,
  onGlobeModeChange,
  exploreAnchorIata,
  selectedStopIndex,
  continentFilter,
  onContinentFilterChange,
  showSpine,
  onShowSpineChange,
  showInspiration,
  onShowInspirationChange,
  inspirationRoutes,
  onLoadInspiration,
  onAirportClick,
  onAddDestination,
  chainMode,
  onChainModeChange,
  mapStyleMode,
  onMapStyleModeChange,
  globeFullscreen,
  onGlobeFullscreenChange,
  zoom,
  onZoomChange,
  previewFutureMembers,
  onPreviewFutureMembersChange,
}: RouteHealthPanelProps) {
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const useDualView = process.env.NEXT_PUBLIC_DUAL_VIEW_GLOBE !== "0";

  const checklist = useMemo(
    () =>
      buildValidationChecklist({
        result,
        stops,
        legTypes,
        legDetails,
        legNetwork,
        networkLoading,
        networkError,
        ticket,
      }),
    [result, stops, legTypes, legDetails, legNetwork, networkLoading, networkError, ticket],
  );

  const analysis = result?.analysis ?? null;
  const globeProps = {
    mapPoints,
    mapLegs,
    stops,
    legTypes,
    legNetwork,
    legNetworkFeasibility: legNetwork.map((l) => l.feasibility),
    exploreAnchorIata,
    selectedStopIndex,
    continentFilter,
    onContinentFilterChange,
    showSpine,
    onShowSpineChange,
    showInspiration,
    onShowInspirationChange,
    inspirationRoutes,
    onLoadInspiration,
    continentCount: analysis?.continentCount,
    onAirportClick,
    onAddDestination,
    onLegClick: onMapLegClick ?? onFocusLeg,
    highlightedLegIndices: highlightedLegs,
    focusedLegIndex,
    chainMode,
    onChainModeChange,
    mapStyleMode,
    onMapStyleModeChange,
    globeFullscreen,
    onGlobeFullscreenChange,
    zoom,
    onZoomChange,
    previewFutureMembers,
    onPreviewFutureMembersChange,
    travelClass,
    currentAnalysis: analysis,
  };

  return (
    <div className="flex flex-col gap-4" data-testid="route-health-panel">
      {useDualView ? (
        <DualViewExplorer {...globeProps} />
      ) : (
        <GlobeExplorer {...globeProps} />
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-200">What&apos;s checked</h3>
        <ValidationChecklist rows={checklist} onRowClick={onChecklistRow} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Issues</h3>
        <IssuesPanel
          issues={result?.issues ?? []}
          guidanceIssues={result?.guidanceIssues}
          ruleEvaluations={result?.ruleEvaluations ?? []}
          originReturn={analysis?.originReturn ?? null}
          suggestions={result?.suggestions}
          blockingCount={result?.blockingIssueCount}
          onHighlightLegs={onHighlightLegs}
          onApplySuggestion={onApplySuggestion}
        />
      </div>

      <details className="rounded-lg border border-surface-border bg-surface-card/30">
        <summary
          className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300"
          data-testid="advanced-audit-toggle"
        >
          Show technical rule audit
        </summary>
        <div className="border-t border-surface-border p-3">
          <ComplianceReport
            ruleEvaluations={result?.ruleEvaluations ?? []}
            originReturn={analysis?.originReturn ?? null}
            valid={result?.valid ?? false}
            scheduleComplete={scheduleComplete}
            onHighlightLegs={onHighlightLegs}
          />
        </div>
      </details>

      <details
        className="rounded-lg border border-surface-border bg-surface-card/30"
        open={budgetsOpen}
        onToggle={(e) => setBudgetsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300">
          Segment budgets by region
        </summary>
        <div className="border-t border-surface-border p-3">
          <SegmentBudgets analysis={analysis} onHighlightLegs={onHighlightLegs} />
        </div>
      </details>
    </div>
  );
}
