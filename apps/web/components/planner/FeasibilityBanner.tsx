"use client";

import { formatCarrierList } from "../../lib/carrier-labels";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import { hubActionsFromNetwork } from "../../lib/hub-suggestions";
import { HubSuggestionCard } from "./HubSuggestionCard";

export interface FeasibilityBannerProps {
  legIndex: number;
  from: string;
  to: string;
  network: LegNetworkState;
  loading?: boolean;
  onInsertHub: (hub: string, legIndex: number) => void;
  onRetry?: () => void;
}

export function FeasibilityBanner({
  legIndex,
  from,
  to,
  network,
  loading,
  onInsertHub,
  onRetry,
}: FeasibilityBannerProps) {
  if (loading && network.feasibility !== "surface") {
    return (
      <p
        className="text-caption text-surface-muted"
        data-testid={`leg-feasibility-${legIndex}`}
        role="status"
      >
        Checking published oneworld routes…
      </p>
    );
  }

  if (network.feasibility === "surface") {
    return (
      <p className="text-xs text-surface-muted" data-testid={`leg-feasibility-${legIndex}`}>
        Overland sector — no flight needed
      </p>
    );
  }

  if (network.feasibility === "error") {
    return (
      <div className="text-xs text-surface-muted" data-testid={`leg-feasibility-${legIndex}`}>
        Couldn&apos;t load route data.{" "}
        {onRetry && (
          <button type="button" className="text-blue-400 underline" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (network.confidence === "inactive") {
    return (
      <div data-testid={`leg-feasibility-${legIndex}`}>
        <p className="text-xs text-amber-300/90" role="status">
          {network.planningHint ?? "No recent nonstop observed — use connections"}
        </p>
      </div>
    );
  }

  if (network.feasibility === "none") {
    return (
      <div data-testid={`leg-feasibility-${legIndex}`}>
        {network.previewNote && (
          <p className="mb-1 text-[10px] text-purple-300/90">{network.previewNote}</p>
        )}
        <p className="text-xs text-amber-300/90" role="status">
          {network.planningHint ?? "No recent nonstop on alliance index — verify with airline"}
        </p>
        {network.regionalHint && (
          <p className="mt-1 text-[11px] text-amber-200/80">{network.regionalHint}</p>
        )}
      </div>
    );
  }

  if (network.feasibility === "direct") {
    return (
      <div data-testid={`leg-feasibility-${legIndex}`}>
        {network.previewNote && (
          <p className="mb-1 text-[10px] text-purple-300/90">{network.previewNote}</p>
        )}
        <p
          className="text-xs text-green-400/90"
          role="status"
          title={network.disclaimer}
        >
          {network.confidence === "observed"
            ? "✓ Published alliance route (verify timetable):"
            : "✓ Route index (verify timetable):"}{" "}
          {formatCarrierList(network.directCarriers)}
        </p>
        {network.planningHint && (
          <p className="mt-0.5 text-[10px] text-surface-muted">{network.planningHint}</p>
        )}
      </div>
    );
  }

  if (network.feasibility === "connect") {
    const actions = hubActionsFromNetwork(
      legIndex,
      from,
      to,
      network.suggestedHubs,
    );
    return (
      <div className="space-y-2" data-testid={`leg-feasibility-${legIndex}`}>
        {network.previewNote && (
          <p className="text-[10px] text-purple-300/90">{network.previewNote}</p>
        )}
        <p className="text-xs text-amber-300/90" role="status" title={network.disclaimer}>
          ⚠ No direct route — connect via a hub
        </p>
        <div className="flex flex-col gap-1">
          {actions.slice(0, 2).map((a) => (
            <HubSuggestionCard key={a.hub} action={a} onInsert={() => onInsertHub(a.hub, legIndex)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid={`leg-feasibility-${legIndex}`}>
      {network.previewNote && (
        <p className="mb-1 text-[10px] text-purple-300/90">{network.previewNote}</p>
      )}
      <p className="text-xs text-surface-muted" title={network.disclaimer}>
        No published oneworld route — verify with airline
      </p>
      {network.regionalHint && (
        <p className="mt-1 text-[11px] text-amber-200/80">{network.regionalHint}</p>
      )}
    </div>
  );
}
