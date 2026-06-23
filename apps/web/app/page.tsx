"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Continent,
  ItinerarySuggestion,
  MapStyleMode,
  StopIntent,
  TicketContext,
  TravelClass,
  ValidationResult,
} from "@oneworld-explorer/core";
import {
  ItineraryPlanner,
} from "../components/planner";
import { ExploreColumn } from "../components/explore/ExploreColumn";
import { SlimHeroBar } from "../components/shell/SlimHeroBar";
import { RouteTextBar } from "../components/shell/RouteTextBar";
import { HealthDrawer } from "../components/shell/HealthDrawer";
import type { InspirationRoute } from "../components/globe";
import { kmBetween, mapDataFromAnalysis } from "../components/RouteMap";
import type { MapLeg, MapPoint } from "../components/RouteMap";
import { useRouteNetwork } from "../hooks/useRouteNetwork";
import { useNetworkNodes } from "../hooks/useNetworkNodes";
import { oneworldRtwBook } from "../lib/external-search-links";
import { getRouteStarter, type RouteStarter } from "../lib/route-starters";
import {
  buildSegmentsFromStops,
  emptyLegDetails,
  type LegBookingDetails,
} from "../lib/segment-booking";
import { appendAfterAnchor } from "../lib/globe-chain-state";
import {
  defaultMobileTab,
  plannerPhase,
  type PlannerPhase,
} from "../lib/planner/planner-phase";

function gridClassForPhase(phase: PlannerPhase): string {
  switch (phase) {
    case "empty":
      return "lg:grid-cols-[minmax(280px,32%)_1fr]";
    case "building":
      return "lg:grid-cols-[minmax(300px,40%)_1fr]";
    case "auditing":
      return "lg:grid-cols-[minmax(320px,52%)_1fr]";
  }
}
import { mapDataFromStops } from "../lib/draft-map-data";
import {
  insertHubAt,
  insertStopAt,
  insertStopBeforeReturn,
  isValidIata,
  setReturnStop,
  type ItineraryState,
} from "../lib/itinerary-mutations";

const DEFAULT_STOPS: string[] = [];
const DEFAULT_LEG_TYPES: ("flight" | "surface")[] = [];

function stopsReadyForValidation(stops: string[]): boolean {
  return stops.length >= 2 && stops.every((s) => /^[A-Z]{3}$/i.test(s.trim()));
}

function emptyStopIntents(length: number): StopIntent[] {
  return Array.from({ length }, () => "unknown" as StopIntent);
}

function allFlightLegsScheduled(
  legTypes: ("flight" | "surface")[],
  legDetails: LegBookingDetails[],
): boolean {
  let hasFlight = false;
  for (let i = 0; i < legTypes.length; i++) {
    if (legTypes[i] === "surface") continue;
    hasFlight = true;
    const d = legDetails[i];
    if (!d?.departureTime?.trim() || !d?.arrivalTime?.trim()) return false;
  }
  return hasFlight;
}

export default function HomePage() {
  const [stops, setStops] = useState<string[]>(DEFAULT_STOPS);
  const [legTypes, setLegTypes] =
    useState<("flight" | "surface")[]>(DEFAULT_LEG_TYPES);
  const [travelClass, setTravelClass] = useState<TravelClass>("economy");
  const [legDetails, setLegDetails] = useState<LegBookingDetails[]>(() =>
    emptyLegDetails(DEFAULT_LEG_TYPES.length),
  );
  const [stopIntents, setStopIntents] = useState<StopIntent[]>(() =>
    emptyStopIntents(DEFAULT_STOPS.length),
  );
  const [ticket, setTicket] = useState<TicketContext>({});
  const [agentDetailsOpen, setAgentDetailsOpen] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlightedLegs, setHighlightedLegs] = useState<number[]>([]);
  const [focusedLegIndex, setFocusedLegIndex] = useState<number | null>(null);
  const [expandedLegDetails, setExpandedLegDetails] = useState<Set<number>>(
    () => new Set(),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const forceTicketReadyRef = useRef(false);
  const legCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [exploreAnchorIata, setExploreAnchorIata] = useState<string | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [continentFilter, setContinentFilter] = useState<string | null>(null);
  const [showSpine, setShowSpine] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [inspirationRoutes, setInspirationRoutes] = useState<InspirationRoute[]>([]);
  const [previewFutureMembers, setPreviewFutureMembers] = useState(false);
  const [hubInsertMessage, setHubInsertMessage] = useState<string | null>(null);
  const [returnLocked, setReturnLocked] = useState(false);
  const [chainMode, setChainMode] = useState(true);
  const [globeZoom, setGlobeZoom] = useState(1);
  const [mapStyleMode, setMapStyleMode] = useState<MapStyleMode>("continents");
  const [globeFullscreen, setGlobeFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"plan" | "explore" | "checks">("explore");

  const phase = useMemo(
    () => plannerPhase(stops, legDetails, result),
    [stops, legDetails, result],
  );
  const phaseGridClass = gridClassForPhase(phase);

  useEffect(() => {
    setMobileTab(defaultMobileTab(phase));
  }, [phase]);

  const { legs: legNetwork, loading: networkLoading, error: networkError, refetch } =
    useRouteNetwork(stops, legTypes, previewFutureMembers);
  const { nodes: networkNodes } = useNetworkNodes();

  const legHasTimes = useMemo(
    () =>
      legDetails.map(
        (d, i) =>
          legTypes[i] !== "surface" &&
          Boolean(d?.departureTime?.trim() || d?.arrivalTime?.trim()),
      ),
    [legDetails, legTypes],
  );

  const validate = useCallback(async (options?: { ticketReady?: boolean }) => {
    if (!stopsReadyForValidation(stops)) {
      setResult(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    const ticketReady = options?.ticketReady ?? forceTicketReadyRef.current;
    forceTicketReadyRef.current = false;

    setLoading(true);
    setValidationError(null);

    try {
      const segments = buildSegmentsFromStops(stops, legTypes, legDetails);
      const scheduleComplete = allFlightLegsScheduled(legTypes, legDetails);
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments,
          travelClass,
          ticket,
          stopIntents,
          validationMode: scheduleComplete ? "scheduleComplete" : undefined,
          ...(ticketReady ? { validationPhase: "ticketReady" } : {}),
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Validation request failed (${res.status})`);

      const data = (await res.json()) as ValidationResult;
      if (requestId !== requestIdRef.current) return;
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setValidationError(
        err instanceof Error ? err.message : "Validation failed. Please try again.",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [stops, legTypes, travelClass, legDetails, ticket, stopIntents]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void validate(), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [validate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("owe.mapStyle");
      if (
        saved === "continents" ||
        saved === "tc-zones" ||
        saved === "countries" ||
        saved === "minimal"
      ) {
        setMapStyleMode(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("owe.mapStyle", mapStyleMode);
    } catch {
      /* ignore */
    }
  }, [mapStyleMode]);

  useEffect(() => {
    void fetch("/api/routes/inspiration")
      .then((r) => r.json())
      .then((body: { routes: InspirationRoute[] }) => {
        setInspirationRoutes(body.routes ?? []);
      })
      .catch(() => {});
  }, []);

  const stopContinents = useMemo(() => {
    const map: Record<number, Continent | null> = {};
    if (result?.analysis) {
      const byIata = new Map<string, Continent>();
      for (const seg of result.analysis.segments) {
        byIata.set(seg.from.iata, seg.from.continent);
        byIata.set(seg.to.iata, seg.to.continent);
      }
      stops.forEach((s, i) => {
        map[i] = byIata.get(s) ?? null;
      });
    }
    return map;
  }, [result, stops]);

  const unknownStops = useMemo(() => {
    const set = new Set<number>();
    if (!result) return set;
    for (const issue of result.issues) {
      if (issue.code === "UNKNOWN_AIRPORT") {
        stops.forEach((s, i) => {
          if (issue.message.includes(s) || issue.evidence?.some((e) => e.includes(s))) {
            set.add(i);
          }
        });
      }
    }
    return set;
  }, [result, stops]);

  const mapData = useMemo(() => {
    if (result?.analysis) return mapDataFromAnalysis(result.analysis);
    return mapDataFromStops(stops, legTypes, exploreAnchorIata, networkNodes);
  }, [result, stops, legTypes, exploreAnchorIata, networkNodes]);

  const legDistancesKm = useMemo(() => {
    const byIata = new Map(mapData.points.map((p) => [p.iata, p]));
    return stops.slice(0, -1).map((from, i) => {
      const to = stops[i + 1];
      const a = byIata.get(from);
      const b = to ? byIata.get(to) : undefined;
      if (a && b) return kmBetween(a, b);
      return null;
    });
  }, [stops, mapData.points]);

  const scheduleComplete = result?.scheduleSummary?.mode === "scheduleComplete";

  function currentItinerary(): ItineraryState {
    return { stops, legTypes, legDetails, stopIntents, returnLocked };
  }

  function applyItinerary(next: ItineraryState) {
    setStops(next.stops);
    setLegTypes(next.legTypes);
    setLegDetails(next.legDetails);
    setStopIntents(next.stopIntents);
    if (next.returnLocked !== undefined) setReturnLocked(next.returnLocked);
  }

  function scrollToLeg(index: number, expandDetails = false) {
    setFocusedLegIndex(index);
    setHighlightedLegs([index]);
    if (expandDetails) {
      setExpandedLegDetails((prev) => new Set(prev).add(index));
    }
    requestAnimationFrame(() => {
      legCardRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function applySuggestion(suggestion: ItinerarySuggestion) {
    if (suggestion.kind === "mark_surface" && suggestion.legIndex != null) {
      const next = [...legTypes];
      if (next[suggestion.legIndex]) {
        next[suggestion.legIndex] = "surface";
        setLegTypes(next);
      }
      return;
    }

    if (suggestion.kind === "insert_stop") {
      const legIdx = suggestion.legIndex ?? 0;
      const dest = stops[legIdx + 1] ?? "";
      applyItinerary(insertStopAt(currentItinerary(), legIdx + 1, suggestion.to));
      if (dest) {
        setHubInsertMessage(`Added ${suggestion.to} — ${dest} is still on your route`);
        setTimeout(() => setHubInsertMessage(null), 5000);
      }
      scrollToLeg(legIdx);
      return;
    }

    if (suggestion.kind === "connect_chain" && suggestion.legIndex != null) {
      const next = [...legTypes];
      next[suggestion.legIndex] = "surface";
      setLegTypes(next);
    }
  }

  function insertHub(hub: string, legIndex: number) {
    const from = stops[legIndex] ?? "";
    const dest = stops[legIndex + 1] ?? "";
    applyItinerary(insertHubAt(currentItinerary(), legIndex, hub));
    if (dest) {
      setHubInsertMessage(`Added ${hub} between ${from} and ${dest} — ${dest} is still on your route`);
      setTimeout(() => setHubInsertMessage(null), 5000);
    }
    scrollToLeg(legIndex);
  }

  function loadStarter(starter: RouteStarter) {
    setStops([...starter.stops]);
    setLegTypes([...starter.legTypes]);
    setTravelClass(starter.travelClass);
    setLegDetails(emptyLegDetails(Math.max(0, starter.stops.length - 1)));
    setStopIntents(emptyStopIntents(starter.stops.length));
    setExpandedLegDetails(new Set());
    setResult(null);
    setReturnLocked(false);
    if (starter.stops.length === 0) {
      setExploreAnchorIata(null);
      setSelectedStopIndex(null);
    } else {
      const last = starter.stops[starter.stops.length - 1];
      if (last) setExploreAnchorIata(last.toUpperCase());
    }
  }

  function loadInspiration(id: string) {
    const starter = getRouteStarter(id);
    if (starter) {
      loadStarter(starter);
      return;
    }
    const route = inspirationRoutes.find((r) => r.id === id);
    if (!route) return;
    setStops([...route.stops]);
    setLegTypes(Array(Math.max(0, route.stops.length - 1)).fill("flight") as ("flight" | "surface")[]);
    setLegDetails(emptyLegDetails(route.stops.length - 1));
    setStopIntents(emptyStopIntents(route.stops.length));
    const last = route.stops[route.stops.length - 1];
    if (last) setExploreAnchorIata(last.toUpperCase());
  }

  function handleAirportClick(iata: string) {
    const code = iata.toUpperCase();
    const idx = stops.findIndex((s) => s.toUpperCase() === code);
    if (idx >= 0) {
      setSelectedStopIndex(idx);
      setExploreAnchorIata(code);
      return;
    }
    if (stops.length === 0 || !stops[0]?.trim()) {
      setStops([code]);
      setLegTypes([]);
      setExploreAnchorIata(code);
      setSelectedStopIndex(0);
      return;
    }
    if (chainMode) {
      handleAddDestination(code);
      return;
    }
    setExploreAnchorIata(code);
    setSelectedStopIndex(null);
  }

  function handleAddDestination(iata: string) {
    const code = iata.toUpperCase();
    if (stops.some((s) => s.toUpperCase() === code)) return;

    if (stops.length === 0) {
      setStops([code]);
      setLegTypes([]);
      setExploreAnchorIata(code);
      setSelectedStopIndex(0);
      return;
    }

    const { stops: nextStops, legTypes: nextLegs, insertIndex } = appendAfterAnchor(
      stops,
      legTypes,
      code,
      exploreAnchorIata,
    );
    setStops(nextStops);
    setLegTypes(nextLegs);
    setLegDetails(emptyLegDetails(nextLegs.length));
    setStopIntents(emptyStopIntents(nextStops.length));
    setExploreAnchorIata(code);
    setSelectedStopIndex(insertIndex);
  }

  function handleMapLegClick(legIndex: number) {
    const nextIndex = legIndex + 1;
    const destIata =
      mapData.legs[legIndex]?.to?.iata?.toUpperCase() ??
      (exploreAnchorIata && !stops[nextIndex]?.trim()
        ? exploreAnchorIata.toUpperCase()
        : undefined);

    if (destIata && isValidIata(destIata) && !stops[nextIndex]?.trim()) {
      if (nextIndex < stops.length) {
        applyItinerary({
          ...currentItinerary(),
          stops: stops.map((s, i) => (i === nextIndex ? destIata : s)),
        });
      } else {
        applyItinerary(insertStopAt(currentItinerary(), nextIndex, destIata));
      }
      scrollToLeg(legIndex);
      return;
    }
    scrollToLeg(legIndex);
  }

  function handlePickReturn(iata: string) {
    applyItinerary(setReturnStop(currentItinerary(), iata));
  }

  function handleAddStop() {
    applyItinerary(insertStopBeforeReturn(currentItinerary()));
  }

  function handleChecklistRow(row: { focusLegIndex?: number; id: string }) {
    if (row.focusLegIndex !== undefined) {
      scrollToLeg(row.focusLegIndex, row.id === "times" || row.id === "carriers");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-surface-border bg-surface-card px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-100">oneworld Explorer</h1>
            <p className="text-caption">
              RTW route planner — check Rule 3015, see who flies each leg, search flights
              externally
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href={oneworldRtwBook()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
              data-testid="rtw-book-cta"
            >
              Book on oneworld RTW
            </a>
            <a
              href="https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf"
              className="text-xs text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rule 3015 PDF
            </a>
          </div>
        </div>
      </header>

      {validationError && (
        <div
          className="border-b border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-200"
          role="alert"
        >
          {validationError}
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl space-y-2 px-4 pt-4">
        <RouteTextBar
          stops={stops}
          legTypes={legTypes}
          stopIntents={stopIntents}
          onApply={({ stops: s, legTypes: lt, stopIntents: si }) => {
            setStops(s);
            setLegTypes(lt);
            setStopIntents(si);
            setLegDetails(emptyLegDetails(lt.length));
          }}
        />
        <SlimHeroBar
          stops={stops}
          legDetails={legDetails}
          stopIntents={stopIntents}
          result={result}
          loading={loading}
          networkLoading={networkLoading}
          travelClass={travelClass}
          onHighlightLegs={setHighlightedLegs}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:hidden">
        <div className="flex border-b border-surface-border px-4">
          {(["plan", "explore", "checks"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-4 py-2 text-sm capitalize ${
                mobileTab === tab
                  ? "border-b-2 border-blue-500 text-slate-100"
                  : "text-surface-muted"
              }`}
              onClick={() => setMobileTab(tab)}
            >
              {tab === "plan" ? "Build" : tab === "explore" ? "Explore" : "Checks"}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-0 px-4 pb-4 lg:grid ${phaseGridClass}`}
      >
        <section
          className={`border-b border-surface-border py-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pr-4 ${
            mobileTab === "plan" ? "block" : "hidden lg:block"
          }`}
        >
          <ItineraryPlanner
            stops={stops}
            legTypes={legTypes}
            legDetails={legDetails}
            stopIntents={stopIntents}
            travelClass={travelClass}
            legNetwork={legNetwork}
            networkLoading={networkLoading}
            stopContinents={stopContinents}
            unknownStops={unknownStops}
            legDistancesKm={legDistancesKm}
            legHasTimes={legHasTimes}
            originReturn={result?.analysis?.originReturn ?? null}
            suggestions={result?.suggestions ?? []}
            analysis={result?.analysis ?? null}
            ticket={ticket}
            showFareProduct={
              travelClass === "business" && result?.analysis?.continentCount === 3
            }
            agentDetailsOpen={agentDetailsOpen}
            focusedLegIndex={focusedLegIndex}
            expandedLegDetails={expandedLegDetails}
            onStopsChange={setStops}
            onLegTypesChange={setLegTypes}
            onLegDetailsChange={setLegDetails}
            onStopIntentsChange={setStopIntents}
            onTravelClassChange={setTravelClass}
            onTicketChange={setTicket}
            onAgentDetailsOpenChange={setAgentDetailsOpen}
            onLoadStarter={loadStarter}
            onApplySuggestion={applySuggestion}
            onFocusLeg={setFocusedLegIndex}
            onToggleLegDetails={(index, open) => {
              setExpandedLegDetails((prev) => {
                const next = new Set(prev);
                if (open) next.add(index);
                else next.delete(index);
                return next;
              });
            }}
            onInsertHub={insertHub}
            onNetworkRetry={refetch}
            onRecheck={() => {
              forceTicketReadyRef.current = true;
              void validate({ ticketReady: true });
            }}
            recheckLoading={loading}
            legCardRefs={legCardRefs}
            previewFutureMembers={previewFutureMembers}
            onPreviewFutureMembersChange={setPreviewFutureMembers}
            hubInsertMessage={hubInsertMessage}
            returnLocked={returnLocked}
            onPickReturn={handlePickReturn}
            onAddStop={handleAddStop}
          />
        </section>

        <section
          className={`py-4 lg:sticky lg:top-0 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pl-4 ${
            mobileTab === "explore" ? "block" : "hidden lg:block"
          }`}
        >
          <ExploreColumn
            plannerPhase={phase}
            mapPoints={mapData.points}
            mapLegs={mapData.legs}
            stops={stops}
            legTypes={legTypes}
            legNetwork={legNetwork}
            legNetworkFeasibility={legNetwork.map((l) => l.feasibility)}
            exploreAnchorIata={exploreAnchorIata}
            selectedStopIndex={selectedStopIndex}
            continentFilter={continentFilter}
            onContinentFilterChange={setContinentFilter}
            showSpine={showSpine}
            onShowSpineChange={setShowSpine}
            showInspiration={showInspiration}
            onShowInspirationChange={setShowInspiration}
            inspirationRoutes={inspirationRoutes}
            onLoadInspiration={loadInspiration}
            continentCount={result?.analysis?.continentCount}
            onAirportClick={handleAirportClick}
            onAddDestination={handleAddDestination}
            onLegClick={handleMapLegClick}
            highlightedLegIndices={highlightedLegs}
            focusedLegIndex={focusedLegIndex}
            chainMode={chainMode}
            onChainModeChange={setChainMode}
            mapStyleMode={mapStyleMode}
            onMapStyleModeChange={setMapStyleMode}
            globeFullscreen={globeFullscreen}
            onGlobeFullscreenChange={setGlobeFullscreen}
            zoom={globeZoom}
            onZoomChange={setGlobeZoom}
            previewFutureMembers={previewFutureMembers}
            onPreviewFutureMembersChange={setPreviewFutureMembers}
            travelClass={travelClass}
            currentAnalysis={result?.analysis ?? null}
          />
        </section>
      </div>

      <div className={`${mobileTab === "checks" ? "block" : "hidden"} lg:block`}>
        <HealthDrawer
          result={result}
          loading={loading}
          travelClass={travelClass}
          stops={stops}
          legTypes={legTypes}
          legDetails={legDetails}
          legNetwork={legNetwork}
          networkLoading={networkLoading}
          networkError={networkError}
          ticket={ticket}
          scheduleComplete={scheduleComplete}
          onHighlightLegs={setHighlightedLegs}
          onChecklistRow={handleChecklistRow}
          onApplySuggestion={applySuggestion}
        />
      </div>
    </div>
  );
}
