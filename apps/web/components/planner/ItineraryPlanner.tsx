"use client";

import type { MutableRefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  Continent,
  ItinerarySuggestion,
  OriginReturnSummary,
  ReturnGuide,
  RouteAnalysis,
  StopIntent,
  TicketContext,
  TravelClass,
} from "@oneworld-explorer/core";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import {
  countFilledStops,
  insertStopAt,
  insertStopBeforeReturn,
  isValidIata,
  removeStopAt,
  reorderStops,
  setReturnStop,
  type ItineraryState,
} from "../../lib/itinerary-mutations";
import type { RouteStarter } from "../../lib/route-starters";
import type { LegBookingDetails } from "../../lib/segment-booking";
import { Button } from "../ui";
import { AgentDetailsPanel } from "./AgentDetailsPanel";
import { LegCard } from "./LegCard";
import { RouteStarters } from "./RouteStarters";
import { ReturnGuidePanel } from "./ReturnGuidePanel";
import { StopCard } from "./StopCard";

const TRAVEL_CLASSES: { value: TravelClass; label: string; hint?: string }[] = [
  { value: "economy", label: "Economy" },
  {
    value: "premium-economy",
    label: "Premium economy",
    hint: "Economy fare + cabin surcharge per segment",
  },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

function itineraryState(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  legDetails: LegBookingDetails[],
  stopIntents: StopIntent[],
): ItineraryState {
  return { stops, legTypes, legDetails, stopIntents };
}

export interface ItineraryPlannerProps {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legDetails: LegBookingDetails[];
  stopIntents: StopIntent[];
  travelClass: TravelClass;
  legNetwork: LegNetworkState[];
  networkLoading: boolean;
  stopContinents: Record<number, Continent | null>;
  unknownStops: Set<number>;
  legDistancesKm: (number | null)[];
  legHasTimes: boolean[];
  originReturn: OriginReturnSummary | null;
  suggestions: ItinerarySuggestion[];
  analysis: RouteAnalysis | null;
  ticket: TicketContext;
  showFareProduct?: boolean;
  agentDetailsOpen: boolean;
  focusedLegIndex: number | null;
  expandedLegDetails: Set<number>;
  onStopsChange: (stops: string[]) => void;
  onLegTypesChange: (legTypes: ("flight" | "surface")[]) => void;
  onLegDetailsChange: (details: LegBookingDetails[]) => void;
  onStopIntentsChange: (intents: StopIntent[]) => void;
  onTravelClassChange: (tc: TravelClass) => void;
  onTicketChange: (ticket: TicketContext) => void;
  onAgentDetailsOpenChange: (open: boolean) => void;
  onLoadStarter: (starter: RouteStarter) => void;
  onApplySuggestion: (s: ItinerarySuggestion) => void;
  onFocusLeg: (index: number | null) => void;
  onToggleLegDetails: (index: number, open: boolean) => void;
  onInsertHub: (hub: string, legIndex: number) => void;
  onNetworkRetry: () => void;
  onRecheck: () => void;
  recheckLoading: boolean;
  legCardRefs?: MutableRefObject<Map<number, HTMLDivElement>>;
  previewFutureMembers?: boolean;
  onPreviewFutureMembersChange?: (v: boolean) => void;
  hubInsertMessage?: string | null;
  returnLocked?: boolean;
  onPickReturn?: (iata: string) => void;
  onAddStop?: () => void;
}

export function ItineraryPlanner({
  stops,
  legTypes,
  legDetails,
  stopIntents,
  travelClass,
  legNetwork,
  networkLoading,
  stopContinents,
  unknownStops,
  legDistancesKm,
  legHasTimes,
  originReturn,
  suggestions,
  analysis,
  ticket,
  showFareProduct,
  agentDetailsOpen,
  focusedLegIndex,
  expandedLegDetails,
  onStopsChange,
  onLegTypesChange,
  onLegDetailsChange,
  onStopIntentsChange,
  onTravelClassChange,
  onTicketChange,
  onAgentDetailsOpenChange,
  onLoadStarter,
  onApplySuggestion,
  onFocusLeg,
  onToggleLegDetails,
  onInsertHub,
  onNetworkRetry,
  onRecheck,
  recheckLoading,
  legCardRefs,
  previewFutureMembers = false,
  onPreviewFutureMembersChange,
  hubInsertMessage,
  returnLocked = false,
  onPickReturn,
  onAddStop,
}: ItineraryPlannerProps) {
  const [returnGuide, setReturnGuide] = useState<ReturnGuide | null>(null);
  const [returnGuideLoading, setReturnGuideLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const stopIds = stops.map((s, i) => `${s}-${i}`);

  const originIata = stops[0]?.trim().toUpperCase() ?? "";
  useEffect(() => {
    if (!isValidIata(originIata)) {
      setReturnGuide(null);
      return;
    }
    setReturnGuideLoading(true);
    void fetch(`/api/airports/return-guide?origin=${encodeURIComponent(originIata)}`)
      .then((r) => r.json())
      .then((body: { guide: ReturnGuide | null }) => setReturnGuide(body.guide ?? null))
      .catch(() => setReturnGuide(null))
      .finally(() => setReturnGuideLoading(false));
  }, [originIata]);

  const filledStops = useMemo(() => countFilledStops(stops), [stops]);

  function applyItinerary(next: ItineraryState) {
    onStopsChange(next.stops);
    onLegTypesChange(next.legTypes);
    onLegDetailsChange(next.legDetails);
    onStopIntentsChange(next.stopIntents);
  }

  function currentItinerary(): ItineraryState {
    return itineraryState(stops, legTypes, legDetails, stopIntents);
  }

  function updateStop(index: number, iata: string) {
    const next = [...stops];
    next[index] = iata;
    onStopsChange(next);
  }

  function removeStop(index: number) {
    applyItinerary(removeStopAt(currentItinerary(), index));
  }

  function insertStopAtIndex(index: number, iata: string) {
    applyItinerary(insertStopAt(currentItinerary(), index, iata));
  }

  function pickReturn(iata: string) {
    if (onPickReturn) {
      onPickReturn(iata);
      return;
    }
    applyItinerary(setReturnStop(currentItinerary(), iata));
  }

  function toggleLeg(index: number) {
    const next = [...legTypes];
    next[index] = next[index] === "surface" ? "flight" : "surface";
    onLegTypesChange(next);
  }

  function setStopIntent(index: number, intent: StopIntent) {
    const next = [...stopIntents];
    while (next.length < stops.length) next.push("unknown");
    next[index] = intent;
    onStopIntentsChange(next);
  }

  function updateLegDetail(index: number, patch: Partial<LegBookingDetails>) {
    const next = [...legDetails];
    while (next.length < stops.length - 1) next.push({});
    next[index] = { ...next[index], ...patch };
    onLegDetailsChange(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stopIds.indexOf(String(active.id));
    const newIndex = stopIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = reorderStops(currentItinerary(), oldIndex, newIndex);
    applyItinerary(reordered);
  }

  function networkForLeg(i: number): LegNetworkState {
    return (
      legNetwork.find((l) => l.legIndex === i) ?? {
        legIndex: i,
        from: stops[i] ?? "",
        to: stops[i + 1] ?? "",
        feasibility: networkLoading ? "loading" : "none",
        directCarriers: [],
        suggestedHubs: [],
        disclaimer: "",
      }
    );
  }

  return (
    <div className="space-y-4">
      <details
        className="rounded-lg border border-surface-border bg-surface-card/30"
        data-testid="templates-panel"
      >
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300">
          Templates
        </summary>
        <div className="border-t border-surface-border p-3">
          <RouteStarters onSelect={onLoadStarter} />
        </div>
      </details>

      {onPreviewFutureMembersChange && agentDetailsOpen && (
        <p className="rounded-lg border border-surface-border bg-surface-card/30 px-3 py-2 text-xs text-surface-muted">
          Philippine Airlines preview moved to globe <strong>Network options</strong>.
        </p>
      )}

      {isValidIata(originIata) && (
        <details
          className="rounded-lg border border-surface-border bg-surface-card/30"
          data-testid="return-options-panel"
          open={originReturn?.mode === "openJawPending"}
        >
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300">
            Return options
          </summary>
          <div className="border-t border-surface-border p-3">
            <ReturnGuidePanel
              guide={returnGuide}
              loading={returnGuideLoading}
              onPickReturn={pickReturn}
            />
          </div>
        </details>
      )}

      {hubInsertMessage && (
        <p
          className="rounded-lg border border-green-900/40 bg-green-950/20 px-3 py-2 text-xs text-green-200"
          data-testid="hub-insert-message"
        >
          {hubInsertMessage}
        </p>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-surface-muted">Cabin for fare hint</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {TRAVEL_CLASSES.map((tc) => (
              <button
                key={tc.value}
                type="button"
                data-testid={`cabin-selector-${tc.value}`}
                onClick={() => onTravelClassChange(tc.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  travelClass === tc.value
                    ? "bg-blue-600 text-white"
                    : "border border-surface-border bg-surface-card text-surface-muted hover:text-slate-200"
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>
          {travelClass === "premium-economy" && (
            <p className="mt-1 text-caption text-amber-200/80" title="Economy Explorer fare + premium cabin surcharge per flown segment">
              Premium cabin surcharge applies per segment
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onRecheck} disabled={recheckLoading}>
          {recheckLoading ? "Checking…" : "Re-check"}
        </Button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-200">Your itinerary</h2>
        <p className="text-caption">
          {stops.length === 0
            ? "Pick your origin on the globe or search for an airport above"
            : "Drag to reorder stops · checks run automatically"}
        </p>

        {stops.length === 0 && (
          <p
            className="mt-3 rounded-lg border border-dashed border-surface-border bg-surface-card/30 px-4 py-6 text-center text-sm text-surface-muted"
            data-testid="itinerary-empty-state"
          >
            No stops yet. Click an airport on the globe or use the search above the map.
          </p>
        )}

        {suggestions.length > 0 && (
          <ul className="mt-2 space-y-1 text-caption">
            {suggestions.slice(0, 3).map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="text-blue-400 hover:underline"
                  onClick={() => onApplySuggestion(s)}
                >
                  {s.kind === "insert_stop" && `Suggestion: add ${s.to} as a stop`}
                  {s.kind === "mark_surface" && `Suggestion: mark a leg as surface`}
                </button>
              </li>
            ))}
          </ul>
        )}

        {stops.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
            <div className="mt-3 space-y-3">
              {stops.map((stop, i) => (
                <div key={stopIds[i]}>
                  <StopCard
                    id={stopIds[i]!}
                    index={i}
                    stop={stop}
                    stopsLength={stops.length}
                    stopContinents={stopContinents}
                    unknownStops={unknownStops}
                    originReturn={originReturn}
                    returnGuideHint={
                      i === stops.length - 1 &&
                      i > 0 &&
                      originReturn?.mode === "openJawPending"
                        ? returnGuide?.summaryHint ?? null
                        : null
                    }
                    showReturnError={
                      i === stops.length - 1 &&
                      i > 0 &&
                      originReturn?.mode === "openJawPending" &&
                      isValidIata(stop) &&
                      filledStops >= 3
                    }
                    stopIntent={stopIntents[i] ?? "unknown"}
                    showStopIntent={
                      i >= 1 &&
                      i < stops.length - 1 &&
                      !legHasTimes[i - 1] &&
                      !legHasTimes[i]
                    }
                    onStopIntentChange={(intent) => setStopIntent(i, intent)}
                    onUpdate={updateStop}
                    onRemove={removeStop}
                  />
                  {i < stops.length - 1 && (
                    <div
                      className="my-2"
                      ref={(el) => {
                        if (el && legCardRefs) legCardRefs.current.set(i, el);
                      }}
                    >
                      <LegCard
                        legIndex={i}
                        from={stop}
                        to={stops[i + 1]!}
                        isSurface={legTypes[i] === "surface"}
                        travelClass={travelClass}
                        network={networkForLeg(i)}
                        networkLoading={networkLoading}
                        details={legDetails[i] ?? {}}
                        expanded={expandedLegDetails.has(i)}
                        focused={focusedLegIndex === i}
                        distanceKm={legDistancesKm[i]}
                        onToggleSurface={() => toggleLeg(i)}
                        onDetailsChange={(patch) => updateLegDetail(i, patch)}
                        onToggleExpanded={(open) => onToggleLegDetails(i, open)}
                        onFocus={() => onFocusLeg(i)}
                        onInsertHub={onInsertHub}
                        onInsertStopAt={insertStopAtIndex}
                        onNetworkRetry={onNetworkRetry}
                        nextStopChips={networkForLeg(i).suggestedHubs.map((h) => h.hub).slice(0, 4)}
                        onQuickAddStop={(iata) => insertStopAtIndex(i + 1, iata)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            data-testid="add-stop-button"
            onClick={() => (onAddStop ? onAddStop() : applyItinerary(insertStopBeforeReturn(currentItinerary())))}
          >
            + Add stop
          </Button>
        </div>
      </div>

      <details className="rounded-lg border border-surface-border bg-surface-card/30">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300">
          Ticket details
        </summary>
        <div className="border-t border-surface-border p-3">
          <AgentDetailsPanel
            ticket={ticket}
            onTicketChange={onTicketChange}
            showFareProduct={showFareProduct}
            open={agentDetailsOpen}
            onOpenChange={onAgentDetailsOpenChange}
          />
        </div>
      </details>
    </div>
  );
}
