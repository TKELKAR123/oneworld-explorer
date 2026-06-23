"use client";

import { useMemo, useState } from "react";
import type {
  ItinerarySuggestion,
  TicketContext,
  TravelClass,
  ValidationResult,
} from "@oneworld-explorer/core";
import { buildValidationChecklist } from "../../lib/validation-checklist";
import type { LegBookingDetails } from "../../lib/segment-booking";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import { ComplianceReport } from "../ComplianceReport";
import { SegmentBudgets } from "../SegmentBudgets";
import { IssuesPanel } from "../planner/IssuesPanel";
import { ValidationChecklist } from "../planner/ValidationChecklist";

export interface HealthDrawerProps {
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
  scheduleComplete: boolean;
  onHighlightLegs: (indices: number[]) => void;
  onChecklistRow: (row: { focusLegIndex?: number; id: string }) => void;
  onApplySuggestion?: (suggestion: ItinerarySuggestion) => void;
}

export function HealthDrawer({
  result,
  loading,
  stops,
  legTypes,
  legDetails,
  legNetwork,
  networkLoading,
  networkError,
  ticket,
  scheduleComplete,
  onHighlightLegs,
  onChecklistRow,
  onApplySuggestion,
}: HealthDrawerProps) {
  const [open, setOpen] = useState(false);

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
  const blocking = result?.blockingIssueCount ?? 0;
  const topIssue = result?.issues.find((i) => i.severity === "error")?.message;
  const stripLabel =
    blocking > 0
      ? `${blocking} issue${blocking === 1 ? "" : "s"}${topIssue ? ` · ${topIssue.slice(0, 48)}` : ""}`
      : result?.outcome === "valid" || result?.outcome === "validWithWarnings"
        ? "All clear"
        : result?.analysis?.originReturn.mode === "openJawPending"
          ? "Pick a permitted return airport"
          : stops.length >= 2
            ? "Draft — add stops or Re-check for full audit"
            : "Add stops to check";

  if (stops.length === 0) return null;

  return (
    <div className="border-t border-surface-border bg-surface-card/50" data-testid="health-drawer">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5"
        data-testid="health-drawer-strip"
      >
        <p className="min-w-0 truncate text-sm text-slate-300">{stripLabel}</p>
        <button
          type="button"
          className="shrink-0 rounded-md border border-surface-border bg-surface-card px-3 py-1 text-xs text-slate-200 hover:bg-surface-card/80"
          data-testid="health-drawer-open"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close checks" : "Open checks ▾"}
        </button>
      </div>

      {open && (
        <div className="mx-auto max-w-7xl space-y-4 border-t border-surface-border px-4 py-4">
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
              blockingCount={blocking}
              onHighlightLegs={onHighlightLegs}
              onApplySuggestion={onApplySuggestion}
            />
          </div>

          <details className="rounded-lg border border-surface-border bg-surface-card/30">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-300">
              Segment budgets by region
            </summary>
            <div className="border-t border-surface-border p-3">
              <SegmentBudgets analysis={analysis} onHighlightLegs={onHighlightLegs} />
            </div>
          </details>

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
        </div>
      )}
    </div>
  );
}
