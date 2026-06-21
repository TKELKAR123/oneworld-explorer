"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AddStopImpact, RouteAnalysis, TravelClass } from "@oneworld-explorer/core";
import { useDestinations } from "../../hooks/useDestinations";
import type { DestinationClient } from "../globe/explore-fan-style";
import { selectArcDestinations, selectImpactCandidates } from "../globe/globe-controls";

export interface ExploreContextValue {
  anchorIata: string | null;
  destinations: DestinationClient[];
  arcDestinations: DestinationClient[];
  destinationsLoading: boolean;
  destinationsError: boolean;
  total: number;
  truncated: boolean;
  hoverDest: string | null;
  setHoverDest: (iata: string | null) => void;
  getImpact: (iata: string) => AddStopImpact | undefined;
  prefetchImpact: (iata: string) => void;
}

const ExploreContext = createContext<ExploreContextValue | null>(null);

export function useExploreOptional(): ExploreContextValue | null {
  return useContext(ExploreContext);
}

export function useExplore(): ExploreContextValue {
  const ctx = useExploreOptional();
  if (!ctx) throw new Error("useExplore must be used within ExploreProvider");
  return ctx;
}

export interface ExploreProviderProps {
  anchorIata: string | null;
  stops: string[];
  legTypes: ("flight" | "surface")[];
  travelClass: TravelClass;
  currentAnalysis: RouteAnalysis | null;
  continentFilter: string | null;
  maxImpactBatch?: number;
  children: ReactNode;
}

export function ExploreProvider({
  anchorIata,
  stops,
  legTypes,
  travelClass,
  currentAnalysis,
  continentFilter,
  maxImpactBatch = 25,
  children,
}: ExploreProviderProps) {
  const { data, loading, error } = useDestinations(anchorIata, continentFilter);
  const rawList = data?.destinations ?? [];
  const [impactCache, setImpactCache] = useState<Record<string, AddStopImpact>>({});
  const [hoverDest, setHoverDest] = useState<string | null>(null);
  const batchAbortRef = useRef<AbortController | null>(null);
  const hoverAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setImpactCache({});
  }, [anchorIata, continentFilter, stops.join("|"), legTypes.join("|")]);

  useEffect(() => {
    batchAbortRef.current?.abort();
    if (!anchorIata || rawList.length === 0) return;

    const timer = setTimeout(() => {
      const candidates = selectImpactCandidates(rawList, maxImpactBatch).map((d) => ({
        iata: d.iata,
        carrierCount: d.carrierCount,
      }));
      if (candidates.length === 0) return;

      const controller = new AbortController();
      batchAbortRef.current = controller;

      void fetch("/api/itinerary/preview-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          stops,
          legTypes,
          anchorIata,
          travelClass,
          currentAnalysis,
          candidates,
        }),
      })
        .then((r) => r.json())
        .then((body: { impacts: Record<string, AddStopImpact> }) => {
          if (controller.signal.aborted) return;
          setImpactCache((prev) => ({ ...prev, ...body.impacts }));
        })
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      batchAbortRef.current?.abort();
    };
  }, [
    anchorIata,
    travelClass,
    stops,
    legTypes,
    currentAnalysis,
    maxImpactBatch,
    rawList.map((d) => `${d.iata}:${d.carrierCount}`).join(","),
  ]);

  const prefetchImpact = useCallback(
    (iata: string) => {
      if (impactCache[iata] || !anchorIata) return;
      const dest = rawList.find((d) => d.iata === iata);
      if (!dest) return;

      hoverAbortRef.current?.abort();
      const controller = new AbortController();
      hoverAbortRef.current = controller;

      void fetch("/api/itinerary/preview-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          stops,
          legTypes,
          anchorIata,
          travelClass,
          currentAnalysis,
          candidates: [{ iata: dest.iata, carrierCount: dest.carrierCount }],
        }),
      })
        .then((r) => r.json())
        .then((body: { impacts: Record<string, AddStopImpact> }) => {
          if (controller.signal.aborted) return;
          setImpactCache((prev) => ({ ...prev, ...body.impacts }));
        })
        .catch(() => {});
    },
    [anchorIata, travelClass, stops, legTypes, currentAnalysis, rawList, impactCache],
  );

  const destinations = useMemo(
    () =>
      rawList.map((d) => ({
        ...d,
        impact: impactCache[d.iata],
      })),
    [rawList, impactCache],
  );

  const arcDestinations = useMemo(
    () => selectArcDestinations(destinations),
    [destinations],
  );

  const value = useMemo<ExploreContextValue>(
    () => ({
      anchorIata,
      destinations,
      arcDestinations,
      destinationsLoading: loading,
      destinationsError: error,
      total: data?.total ?? 0,
      truncated: data?.truncated ?? false,
      hoverDest,
      setHoverDest: (iata) => {
        setHoverDest(iata);
        if (iata) prefetchImpact(iata);
      },
      getImpact: (iata) => impactCache[iata],
      prefetchImpact,
    }),
    [
      anchorIata,
      destinations,
      arcDestinations,
      loading,
      error,
      data?.total,
      data?.truncated,
      hoverDest,
      impactCache,
      prefetchImpact,
    ],
  );

  return <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>;
}
