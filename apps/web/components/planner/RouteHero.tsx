"use client";

import { useCallback, useState } from "react";
import type {
  OriginReturnSummary,
  RouteAnalysis,
  TravelClass,
  ValidationOutcome,
  ValidationResult,
} from "@oneworld-explorer/core";
import type { StopIntent } from "@oneworld-explorer/core";
import { buildFlyerTalkExport, buildRouteChainExport } from "../../lib/flyertalk-export";
import { outcomeLabel } from "../../lib/outcome-label";
import type { LegBookingDetails } from "../../lib/segment-booking";
import { TripSummaryStrip } from "../TripSummaryStrip";
import { SegmentLedgerCompact } from "./SegmentLedgerCompact";
import { Button } from "../ui";

export interface RouteHeroProps {
  stops: string[];
  legDetails: LegBookingDetails[];
  stopIntents: StopIntent[];
  result: ValidationResult | null;
  loading: boolean;
  networkLoading: boolean;
  travelClass: TravelClass;
  onHighlightLegs: (indices: number[]) => void;
}

export function RouteHero({
  stops,
  legDetails,
  stopIntents,
  result,
  loading,
  networkLoading,
  travelClass,
  onHighlightLegs,
}: RouteHeroProps) {
  const [copied, setCopied] = useState<"ft" | "route" | null>(null);
  const pending = loading || networkLoading;
  const analysis = result?.analysis ?? null;
  const phase = result?.validationPhase;
  const outcome = result?.outcome ?? null;

  const copyText = useCallback(
    async (kind: "ft" | "route") => {
      const text =
        kind === "ft"
          ? buildFlyerTalkExport({ stops, legDetails, stopIntents, result, travelClass })
          : buildRouteChainExport(stops);
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    },
    [stops, legDetails, stopIntents, result, travelClass],
  );

  const chain = buildRouteChainExport(stops);
  const emptyState = stops.length === 0;

  return (
    <div
      className={`relative rounded-xl border border-surface-border bg-surface-card/80 px-4 py-3 ${
        pending ? "opacity-80" : ""
      }`}
      data-testid="route-hero"
    >
      {pending && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-surface-card/40"
          data-testid="route-pending"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-3 py-1 text-xs text-surface-muted"
            data-testid="loading-pulse"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Updating route…
          </span>
        </div>
      )}

      <TripSummaryStrip
        outcome={outcome}
        loading={loading && !result}
        blockingCount={result?.blockingIssueCount}
        warningCount={result?.warningCount}
        analysis={analysis}
        travelClass={travelClass}
        rulesVersion={result?.rulesVersion}
        originReturn={analysis?.originReturn ?? null}
        validationPhase={phase}
        emptyState={emptyState}
        narrative={
          emptyState
            ? "Search or click an airport on the globe to start your route."
            : phase === "building"
              ? "Still building — full Rule 3015 audit runs when return and continents are set."
              : undefined
        }
      />

      {emptyState && (
        <p className="mt-2 text-sm text-surface-muted" data-testid="hero-empty-hint">
          Pick your origin on the map or use the airport search below the globe.
        </p>
      )}

      {chain && (
        <p
          className="mt-2 font-mono text-xs text-slate-300 break-all"
          data-testid="route-chain"
        >
          {chain}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-border/60 pt-3">
        <SegmentLedgerCompact analysis={analysis} onHighlightLegs={onHighlightLegs} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          data-testid="copy-flyertalk"
          onClick={() => void copyText("ft")}
        >
          {copied === "ft" ? "Copied!" : "Copy for FlyerTalk"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          data-testid="copy-route"
          onClick={() => void copyText("route")}
        >
          {copied === "route" ? "Copied!" : "Copy route"}
        </Button>
      </div>
    </div>
  );
}
