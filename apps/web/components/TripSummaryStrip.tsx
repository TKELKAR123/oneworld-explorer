import type {
  OriginReturnSummary,
  RouteAnalysis,
  TravelClass,
  ValidationOutcome,
} from "@oneworld-explorer/core";
import { buildSummaryNarrative } from "../lib/summary-narrative";
import { continentLabel } from "../lib/continent-labels";
import { Badge, MetricDivider, MetricPill } from "./ui";

export interface TripSummaryStripProps {
  outcome: ValidationOutcome | null;
  loading?: boolean;
  blockingCount?: number;
  warningCount?: number;
  analysis: RouteAnalysis | null;
  travelClass: TravelClass;
  rulesVersion?: string;
  narrative?: string | null;
  originReturn?: OriginReturnSummary | null;
  validationPhase?: "building" | "ticketReady";
  emptyState?: boolean;
}

function OutcomeBadge({
  outcome,
  loading,
  blockingCount,
  warningCount,
  validationPhase,
  emptyState,
}: {
  outcome: ValidationOutcome | null;
  loading?: boolean;
  blockingCount?: number;
  warningCount?: number;
  validationPhase?: "building" | "ticketReady";
  emptyState?: boolean;
}) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-surface-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        Checking…
      </span>
    );
  }

  if (emptyState) {
    return (
      <Badge variant="metric" className="px-3 py-1.5 text-sm font-semibold" data-testid="hero-status-start">
        Start here
      </Badge>
    );
  }

  if (validationPhase === "building") {
    return (
      <Badge variant="metric" className="px-3 py-1.5 text-sm font-semibold">
        Building
      </Badge>
    );
  }

  if (!outcome) {
    return (
      <Badge variant="metric" className="px-3 py-1.5 text-sm font-semibold">
        Drafting…
      </Badge>
    );
  }

  if (outcome === "valid") {
    return (
      <Badge variant="success" className="px-3 py-1.5 text-sm font-semibold">
        Valid
      </Badge>
    );
  }

  if (outcome === "validWithWarnings") {
    return (
      <Badge variant="warning" className="px-3 py-1.5 text-sm font-semibold">
        Valid with warnings ({warningCount ?? 0})
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className="px-3 py-1.5 text-sm font-semibold">
      Invalid ({blockingCount ?? 0} blockers)
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[80, 100, 64, 72].map((w) => (
        <span
          key={w}
          className="h-7 animate-pulse rounded-full bg-surface-border"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

export function TripSummaryStrip({
  outcome,
  loading,
  blockingCount,
  warningCount,
  analysis,
  travelClass,
  rulesVersion,
  narrative,
  originReturn,
  validationPhase,
  emptyState,
}: TripSummaryStripProps) {
  const summary =
    narrative ??
    (analysis && outcome
      ? buildSummaryNarrative(analysis, outcome, travelClass)
      : null);

  const continentNames =
    analysis?.continentsVisited.map((c) => continentLabel(c)).join(", ") ?? "";

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card/80 px-4 py-3">
      {loading && !analysis ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <OutcomeBadge
            outcome={outcome}
            loading={loading}
            blockingCount={blockingCount}
            warningCount={warningCount}
            validationPhase={validationPhase}
            emptyState={emptyState}
          />

          {analysis && (
            <>
              <MetricDivider />
              <MetricPill
                value={`${analysis.continentCount} continents`}
                title={continentNames || undefined}
              />
              {analysis.suggestedFareBasis && (
                <>
                  <MetricDivider />
                  <MetricPill value={analysis.suggestedFareBasis} mono />
                </>
              )}
              {analysis.direction && (
                <>
                  <MetricDivider />
                  <MetricPill value={analysis.direction} />
                </>
              )}
              {analysis.crossesAtlantic && (
                <>
                  <MetricDivider />
                  <MetricPill value="Atlantic ✓" className="border-green-900/50 text-green-400" />
                </>
              )}
              {analysis.crossesPacific && (
                <>
                  <MetricDivider />
                  <MetricPill value="Pacific ✓" className="border-green-900/50 text-green-400" />
                </>
              )}
              {originReturn && (
                <>
                  <MetricDivider />
                  <MetricPill
                    value={
                      originReturn.mode === "closedLoop"
                        ? `Return: ${originReturn.originIata} ✓`
                        : originReturn.mode === "openJaw"
                          ? `Open jaw: ${originReturn.returnIata} ✓`
                          : `Return: ${originReturn.returnIata}`
                    }
                    title={
                      originReturn.openJawLabel ??
                      (originReturn.mode === "closedLoop"
                        ? "Same origin and return airport"
                        : originReturn.pendingHint)
                    }
                    className={
                      originReturn.mode === "openJawPending"
                        ? "border-amber-900/50 text-amber-400"
                        : "border-green-900/50 text-green-400"
                    }
                  />
                </>
              )}
            </>
          )}

          {rulesVersion && (
            <span className="w-full text-caption sm:ml-auto sm:w-auto">
              Rules {rulesVersion}
            </span>
          )}
        </div>
      )}

      {summary && (
        <p className="mt-3 border-t border-surface-border/60 pt-3 text-body">{summary}</p>
      )}
    </div>
  );
}
