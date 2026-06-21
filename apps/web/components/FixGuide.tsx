"use client";

import { useState } from "react";
import type {
  ItinerarySuggestion,
  OriginReturnSummary,
  RuleEvaluation,
  ValidationIssue,
} from "@oneworld-explorer/core";
import { formatIssue, formatRuleEvaluation } from "../lib/rule-display";
import { Accordion, Badge, Button, Card } from "./ui";

export interface FixGuideProps {
  issues: ValidationIssue[];
  ruleEvaluations: RuleEvaluation[];
  originReturn?: OriginReturnSummary | null;
  suggestions?: ItinerarySuggestion[];
  blockingCount?: number;
  onHighlightLegs?: (indices: number[]) => void;
  onApplySuggestion?: (suggestion: ItinerarySuggestion) => void;
}

function failedEvaluations(evaluations: RuleEvaluation[]): RuleEvaluation[] {
  return evaluations.filter((e) => !e.passed);
}

function EvidenceBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mt-2 rounded-md bg-surface/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
        Evidence
      </p>
      <ul className="mt-1 space-y-0.5 text-caption">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function FixGuide({
  issues,
  ruleEvaluations,
  originReturn,
  suggestions = [],
  blockingCount = 0,
  onHighlightLegs,
  onApplySuggestion,
}: FixGuideProps) {
  const [showPassed, setShowPassed] = useState(false);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const failedRules = failedEvaluations(ruleEvaluations);
  const passedCount = ruleEvaluations.filter(
    (e) => e.passed && e.applicability !== "notApplicable" && e.ruleKind !== "advisory",
  ).length;
  const advisories = ruleEvaluations.filter(
    (e) => e.ruleKind === "advisory" && e.applicability === "active",
  );

  return (
    <div className="space-y-4">
      {originReturn?.mode === "openJawPending" && (
        <Card className="border-amber-900/50 bg-amber-950/20" padding="sm">
          <p className="text-sm font-medium text-amber-400">
            Return ({originReturn.returnIata}) is not in a permitted §4(c) pair with origin (
            {originReturn.originIata})
          </p>
          <p className="mt-1 text-caption">
            {originReturn.pendingHint ??
              "Change the return airport to a permitted open-jaw partner or return to origin."}
          </p>
        </Card>
      )}

      <Card className="border-red-900/50 bg-red-950/20" padding="sm">
        <p className="text-sm font-medium text-red-400">
          Route cannot be sold as oneworld Explorer geometry ({blockingCount || errors.length}{" "}
          blocking {blockingCount === 1 ? "issue" : "issues"})
        </p>
      </Card>

      {errors.map((issue, idx) => {
        const display = formatIssue(issue);
        return (
          <Card key={`err-${issue.code}-${idx}`} className="border-red-900/60 bg-red-950/30">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="danger">Blocker</Badge>
              <Badge variant="ruleId">{display.ruleId}</Badge>
              {display.pdfRef && <span className="text-caption">{display.pdfRef}</span>}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-200">{display.title}</p>
            {issue.message !== display.title && (
              <p className="mt-1 text-caption">{issue.message}</p>
            )}
            {display.evidence && display.evidence.length > 0 && (
              <EvidenceBlock lines={display.evidence} />
            )}
            {issue.segmentIndex != null && onHighlightLegs && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-blue-400"
                onClick={() => onHighlightLegs([issue.segmentIndex!])}
              >
                Show on map
              </Button>
            )}
          </Card>
        );
      })}

      {warnings.map((issue, idx) => (
        <Card key={`warn-${issue.code}-${idx}`} className="border-amber-900/50 bg-amber-950/20">
          <Badge variant="warning">Warning</Badge>
          <p className="mt-2 text-sm text-slate-200">{formatIssue(issue).title}</p>
        </Card>
      ))}

      {failedRules
        .filter((r) => !issues.some((i) => i.code === r.ruleId))
        .map((ev) => {
          const display = formatRuleEvaluation(ev);
          return (
            <Card key={ev.ruleId} className="border-red-900/40 bg-red-950/20">
              <Badge variant="ruleId">{display.ruleId}</Badge>
              <p className="mt-2 text-sm font-medium text-slate-200">{display.title}</p>
              {ev.message && ev.message !== display.title && (
                <p className="mt-1 text-caption">{ev.message}</p>
              )}
              {ev.segmentIndices && ev.segmentIndices.length > 0 && onHighlightLegs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-blue-400"
                  onClick={() => onHighlightLegs(ev.segmentIndices!)}
                >
                  Show on map
                </Button>
              )}
            </Card>
          );
        })}

      {suggestions.length > 0 && onApplySuggestion && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-200">Suggested actions</p>
          {suggestions.map((s, idx) => (
            <button
              key={`sug-${idx}`}
              type="button"
              onClick={() => onApplySuggestion(s)}
              className="block w-full rounded-md border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-left text-sm text-amber-100 hover:bg-amber-950/50"
            >
              {s.kind === "insert_stop" && `Insert stop ${s.to}`}
              {s.kind === "mark_surface" && `Mark surface ${s.from}→${s.to}`}
              {s.kind === "connect_chain" && `Connect ${s.from}→${s.to}`}
              <span className="block text-xs text-amber-200/70">{s.reason}</span>
            </button>
          ))}
        </div>
      )}

      {advisories.length > 0 && (
        <Card className="border-surface-border bg-surface/40" padding="sm">
          <p className="text-xs font-medium text-surface-muted">Product checks (v0.2)</p>
          {advisories.map((ev) => (
            <p key={ev.ruleId} className="mt-1 text-sm text-amber-200">
              {ev.naturalLanguage}
            </p>
          ))}
        </Card>
      )}

      {passedCount > 0 && (
        <Accordion
          title={`Passed applicable checks (${passedCount})`}
          open={showPassed}
          onOpenChange={setShowPassed}
        >
          <ul className="space-y-2">
            {ruleEvaluations
              .filter(
                (e) =>
                  e.passed &&
                  e.applicability !== "notApplicable" &&
                  e.ruleKind !== "advisory",
              )
              .map((e) => {
                const display = formatRuleEvaluation(e);
                return (
                  <li key={e.ruleId} className="text-sm">
                    <span className="text-green-400">✓</span>{" "}
                    <span className="text-slate-200">{display.title}</span>
                    <Badge variant="ruleId" className="ml-2">
                      {display.ruleId}
                    </Badge>
                  </li>
                );
              })}
          </ul>
        </Accordion>
      )}
    </div>
  );
}
