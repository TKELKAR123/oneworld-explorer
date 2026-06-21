"use client";

import { useCallback, useState } from "react";
import type {
  StopIntent,
  TravelClass,
  ValidationResult,
} from "@oneworld-explorer/core";
import { buildFlyerTalkExport, buildRouteChainExport } from "../../lib/flyertalk-export";
import { cabinFareTrackerLabel } from "../../lib/fare-hint";
import type { LegBookingDetails } from "../../lib/segment-booking";
import { SegmentLedgerCompact } from "../planner/SegmentLedgerCompact";
import { Badge, Button } from "../ui";

export interface SlimHeroBarProps {
  stops: string[];
  legDetails: LegBookingDetails[];
  stopIntents: StopIntent[];
  result: ValidationResult | null;
  loading: boolean;
  networkLoading: boolean;
  travelClass: TravelClass;
  onHighlightLegs: (indices: number[]) => void;
}

function outcomeChip(
  stops: string[],
  result: ValidationResult | null,
  loading: boolean,
): { label: string; variant: "metric" | "success" | "warning" | "danger" } {
  if (stops.length === 0) return { label: "Start here", variant: "metric" };
  if (loading && !result) return { label: "Checking…", variant: "metric" };
  if (result?.validationPhase === "building" || !result?.outcome) {
    return { label: "Building", variant: "metric" };
  }
  if (result.outcome === "valid") return { label: "Valid", variant: "success" };
  if (result.outcome === "validWithWarnings") return { label: "Valid · warnings", variant: "warning" };
  return { label: "Invalid", variant: "danger" };
}

export function SlimHeroBar({
  stops,
  legDetails,
  stopIntents,
  result,
  loading,
  networkLoading,
  travelClass,
  onHighlightLegs,
}: SlimHeroBarProps) {
  const [copied, setCopied] = useState(false);
  const pending = loading || networkLoading;
  const chip = outcomeChip(stops, result, loading);
  const chain = buildRouteChainExport(stops);
  const analysis = result?.analysis ?? null;

  const copyFlyerTalk = useCallback(async () => {
    const text = buildFlyerTalkExport({ stops, legDetails, stopIntents, result, travelClass });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stops, legDetails, stopIntents, result, travelClass]);

  return (
    <div
      className={`relative rounded-xl border border-surface-border bg-surface-card/80 px-4 py-2.5 ${
        pending ? "opacity-90" : ""
      }`}
      data-testid="route-hero"
    >
      {pending && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-surface-card/30"
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

      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant={chip.variant}
          className="shrink-0 px-3 py-1 text-sm font-semibold"
          data-testid="outcome-chip"
        >
          {chip.label}
        </Badge>

        <p
          className="min-w-0 flex-1 font-mono text-xs text-slate-300 break-all"
          data-testid="route-chain"
        >
          {chain || "Pick origin — search the explore toolbar"}
        </p>

        <Button
          variant="secondary"
          size="sm"
          data-testid="copy-flyertalk"
          onClick={() => void copyFlyerTalk()}
          disabled={stops.length === 0}
        >
          {copied ? "Copied!" : "Copy for FlyerTalk"}
        </Button>
      </div>

      {stops.length > 0 && (
        <div
          className="mt-2 flex flex-wrap items-center gap-2 border-t border-surface-border/60 pt-2"
        >
          <SegmentLedgerCompact analysis={analysis} onHighlightLegs={onHighlightLegs} />
          <span className="text-xs text-slate-400" data-testid="cabin-fare-tracker">
            {cabinFareTrackerLabel(analysis, travelClass)}
          </span>
        </div>
      )}
    </div>
  );
}
