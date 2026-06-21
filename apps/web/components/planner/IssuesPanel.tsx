"use client";

import { useState } from "react";
import type {
  ItinerarySuggestion,
  OriginReturnSummary,
  RuleEvaluation,
  ValidationIssue,
} from "@oneworld-explorer/core";
import { plainIssueDetail, plainIssueHeadline } from "../../lib/plain-issue-copy";
import { Badge, Button, Card } from "../ui";

export interface IssuesPanelProps {
  issues: ValidationIssue[];
  guidanceIssues?: ValidationIssue[];
  ruleEvaluations: RuleEvaluation[];
  originReturn?: OriginReturnSummary | null;
  suggestions?: ItinerarySuggestion[];
  blockingCount?: number;
  onHighlightLegs?: (indices: number[]) => void;
  onApplySuggestion?: (suggestion: ItinerarySuggestion) => void;
}

export function IssuesPanel({
  issues,
  guidanceIssues = [],
  originReturn,
  suggestions = [],
  blockingCount = 0,
  onApplySuggestion,
}: IssuesPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const visibleErrors = showAll ? errors : errors.slice(0, 3);

  if (
    errors.length === 0 &&
    warnings.length === 0 &&
    guidanceIssues.length === 0 &&
    originReturn?.mode !== "openJawPending"
  ) {
    return (
      <div data-testid="issues-panel">
        <Card className="border-green-900/40 bg-green-950/15" padding="sm">
          <p className="text-sm text-green-200">
            No blocking issues on route shape. Add flight times and airlines for a full booking
            check.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="issues-panel">
      {guidanceIssues.length > 0 && (
        <Card className="border-blue-900/40 bg-blue-950/15" padding="sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">
            While building
          </p>
          <ul className="space-y-1">
            {guidanceIssues.map((issue, i) => (
              <li key={`${issue.code}-${i}`} className="text-sm text-blue-100">
                {issue.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {originReturn?.mode === "openJawPending" && (
        <Card className="border-amber-900/50 bg-amber-950/20" padding="sm">
          <p className="text-sm font-medium text-amber-300">
            Return ({originReturn.returnIata}) is not allowed with origin (
            {originReturn.originIata})
          </p>
          <p className="mt-1 text-caption">
            {originReturn.pendingHint ??
              "Pick a return airport in a permitted open-jaw pair with your origin."}
          </p>
        </Card>
      )}

      {errors.length > 0 && (
        <Card className="border-red-900/50 bg-red-950/20" padding="sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">
            Needs fixes ({blockingCount || errors.length})
          </p>
          <ul className="space-y-2">
            {visibleErrors.map((issue, i) => (
              <li key={`${issue.code}-${i}`} className="text-sm text-red-100">
                <p className="font-medium">{plainIssueHeadline(issue)}</p>
                {plainIssueDetail(issue) && (
                  <p className="mt-0.5 text-caption text-red-200/80">{plainIssueDetail(issue)}</p>
                )}
                <Badge variant="ruleId" className="mt-1">
                  {issue.code}
                </Badge>
              </li>
            ))}
          </ul>
          {errors.length > 3 && !showAll && (
            <button
              type="button"
              className="mt-2 text-xs text-red-300 underline"
              onClick={() => setShowAll(true)}
            >
              All issues ({errors.length})
            </button>
          )}
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-amber-900/50 bg-amber-950/20" padding="sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
            Caveats
          </p>
          <ul className="space-y-2">
            {warnings.map((issue, i) => (
              <li key={`${issue.code}-w-${i}`} className="text-sm text-amber-100">
                {plainIssueHeadline(issue)}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {suggestions.length > 0 && onApplySuggestion && (
        <Card padding="sm">
          <p className="text-xs font-medium text-surface-muted">Suggested fixes</p>
          <ul className="mt-2 space-y-1">
            {suggestions.map((s, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onApplySuggestion(s)}
                >
                  {s.kind === "insert_stop" && `Add ${s.to} as stop`}
                  {s.kind === "mark_surface" && `Mark leg ${(s.legIndex ?? 0) + 1} as surface`}
                  {s.kind === "connect_chain" && `Connect via surface`}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
