"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 400;

export type LegFeasibility =
  | "direct"
  | "connect"
  | "none"
  | "surface"
  | "loading"
  | "error";

export interface LegNetworkState {
  legIndex: number;
  from: string;
  to: string;
  feasibility: LegFeasibility;
  directCarriers: string[];
  suggestedHubs: Array<{
    hub: string;
    firstLegCarriers: string[];
    secondLegCarriers: string[];
  }>;
  disclaimer: string;
  previewNote?: string;
  regionalHint?: string;
  confidence?: "observed" | "historical" | "inactive";
  planningHint?: string;
}

interface NetworkApiResponse {
  directCarriers: string[];
  hasDirect: boolean;
  suggestedHubs: LegNetworkState["suggestedHubs"];
  disclaimer: string;
  previewNote?: string;
  regionalHint?: string;
  confidence?: "observed" | "historical" | "inactive";
  planningHint?: string;
}

function feasibilityFromResponse(
  body: NetworkApiResponse,
  isSurface: boolean,
): LegFeasibility {
  if (isSurface) return "surface";
  if (body.hasDirect) return "direct";
  if (body.suggestedHubs.length > 0) return "connect";
  return "none";
}

export async function fetchLegNetworks(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  options?: { previewFutureMembers?: boolean; signal?: AbortSignal },
): Promise<{ legs: LegNetworkState[]; error: boolean }> {
  const signal = options?.signal;
  if (stops.length < 2) return { legs: [], error: false };

  const legs: LegNetworkState[] = [];
  let error = false;

  const tasks = stops.slice(0, -1).map(async (from, i) => {
    const to = stops[i + 1]!;
    const isSurface = legTypes[i] === "surface";

    if (isSurface) {
      return {
        legIndex: i,
        from,
        to,
        feasibility: "surface" as const,
        directCarriers: [],
        suggestedHubs: [],
        disclaimer: "",
      };
    }

    if (from.length !== 3 || to.length !== 3) {
      return {
        legIndex: i,
        from,
        to,
        feasibility: "none" as const,
        directCarriers: [],
        suggestedHubs: [],
        disclaimer: "",
      };
    }

    try {
      const previewParam = options?.previewFutureMembers ? "&preview=future-members" : "";
      const res = await fetch(
        `/api/routes/network?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${previewParam}`,
        { signal },
      );
      if (!res.ok) throw new Error("network fetch failed");
      const body = (await res.json()) as NetworkApiResponse;
      return {
        legIndex: i,
        from,
        to,
        feasibility: feasibilityFromResponse(body, false),
        directCarriers: body.directCarriers,
        suggestedHubs: body.suggestedHubs,
        disclaimer: body.disclaimer,
        previewNote: body.previewNote,
        regionalHint: body.regionalHint,
        confidence: body.confidence,
        planningHint: body.planningHint,
      };
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      error = true;
      return {
        legIndex: i,
        from,
        to,
        feasibility: "error" as const,
        directCarriers: [],
        suggestedHubs: [],
        disclaimer: "",
      };
    }
  });

  const results = await Promise.all(tasks);
  legs.push(...results.sort((a, b) => a.legIndex - b.legIndex));
  return { legs, error };
}

export function useRouteNetwork(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  previewFutureMembers = false,
): {
  legs: LegNetworkState[];
  loading: boolean;
  error: boolean;
  refetch: () => void;
} {
  const [legs, setLegs] = useState<LegNetworkState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (stops.length < 2) {
      setLegs([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const controller = new AbortController();

      void fetchLegNetworks(stops, legTypes, {
        previewFutureMembers,
        signal: controller.signal,
      })
        .then(({ legs: next, error: err }) => {
          setLegs(next);
          setError(err);
        })
        .catch((e) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setError(true);
        })
        .finally(() => setLoading(false));

      abortRef.current = controller;
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [stops, legTypes, tick, previewFutureMembers]);

  return { legs, loading, error, refetch };
}

export function legFeasibilityStroke(feasibility: LegFeasibility): string {
  switch (feasibility) {
    case "direct":
      return "#4ade80";
    case "connect":
      return "#fbbf24";
    case "none":
      return "#f87171";
    case "surface":
      return "#64748b";
    default:
      return "#475569";
  }
}
