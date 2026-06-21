"use client";

import { useMemo, useState } from "react";
import type { OriginReturnSummary, RuleEvaluation } from "@oneworld-explorer/core";
import { categoryLabel, formatRuleEvaluation } from "../lib/rule-display";
import { Accordion, Badge, Button, Card } from "./ui";

const GROUP_ORDER = [
  "origin-return",
  "ocean-crossing",
  "routing",
  "pricing",
  "segment-budget",
  "regional",
  "open-jaw",
  "carrier",
  "structural",
  "other",
];

export interface ComplianceReportProps {
  ruleEvaluations: RuleEvaluation[];
  originReturn?: OriginReturnSummary | null;
  valid?: boolean;
  scheduleComplete?: boolean;
  onHighlightLegs?: (indices: number[]) => void;
}

const TIMING_RULES = new Set([
  "R3015-6-min-stay",
  "R3015-7-max-stay",
  "R3015-8-stopovers",
  "R3015-9-transfers",
]);

function isSelfDeclared(ev: RuleEvaluation): boolean {
  return (
    ev.severity === "warning" &&
    (ev.category === "self-declared" || ev.message?.includes("Self-declared") === true)
  );
}

function isVerifiedTiming(ev: RuleEvaluation, scheduleComplete?: boolean): boolean {
  return Boolean(scheduleComplete && ev.passed && TIMING_RULES.has(ev.ruleId));
}

function verificationBadge(
  ev: RuleEvaluation,
  scheduleComplete?: boolean,
): { label: string; variant: "warning" | "success" } | null {
  if (isSelfDeclared(ev)) return { label: "Self-declared", variant: "warning" };
  if (isVerifiedTiming(ev, scheduleComplete)) return { label: "Verified", variant: "success" };
  return null;
}


function notApplicableTooltip(ruleId: string): string {
  if (
    ruleId === "R3015-6-min-stay" ||
    ruleId === "R3015-7-max-stay" ||
    ruleId === "R3015-8-stopovers" ||
    ruleId === "R3015-5-reservations"
  ) {
    return "Add flight times or mark stop intent (stopover/connection) to activate this check";
  }
  if (
    ruleId === "R3015-5b-booking" ||
    ruleId.startsWith("R3015-5")
  ) {
    return "Add booking class (RBD) on attached flights to activate";
  }
  if (
    ruleId.includes("carrier") ||
    ruleId.startsWith("R3015-4j") ||
    ruleId.startsWith("R3015-4-affiliates") ||
    ruleId === "R3015-9-transfers" ||
    ruleId.startsWith("R3015-15")
  ) {
    return "Add carriers to activate this check";
  }
  if (ruleId.startsWith("R3015-4c-open-jaw-")) {
    return "Applies when your origin and return airports form this §4(c) open-jaw pattern";
  }
  return "Not relevant until you add more route or booking details";
}

function isDisplayable(ev: RuleEvaluation): boolean {
  if (ev.applicability === "notApplicable") return false;
  if (ev.ruleKind === "advisory") return false;
  return true;
}

function groupLabel(group: string): string {
  const labels: Record<string, string> = {
    "origin-return": "Origin & return",
    "ocean-crossing": "Ocean crossings",
    "open-jaw": "Open-jaw exceptions",
    "segment-budget": "Segment budgets",
    regional: "Regional limits",
    carrier: "Carrier",
  };
  return labels[group] ?? categoryLabel(group);
}

function PassedRuleRow({
  ev,
  onHighlightLegs,
  scheduleComplete,
}: {
  ev: RuleEvaluation;
  onHighlightLegs?: (indices: number[]) => void;
  scheduleComplete?: boolean;
}) {
  const display = formatRuleEvaluation(ev);
  const badge = verificationBadge(ev, scheduleComplete);

  return (
    <li className="border-b border-surface-border/50 py-3 last:border-0">
      <div className="flex gap-2">
        <span className="mt-0.5 shrink-0 text-green-400" aria-hidden>
          ✓
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-medium leading-snug text-slate-200">{display.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ruleId">{display.ruleId}</Badge>
            {badge && (
              <Badge variant={badge.variant} title={badge.label}>
                {badge.label}
              </Badge>
            )}
            {display.pdfRef && <span className="text-caption">{display.pdfRef}</span>}
          </div>
          {display.evidence && display.evidence.length > 0 && (
            <div className="rounded-md bg-surface/60 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
                Evidence
              </p>
              <ul className="mt-1 space-y-0.5 text-caption">
                {display.evidence.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {ev.segmentIndices && ev.segmentIndices.length > 0 && onHighlightLegs && (
            <button
              type="button"
              onClick={() => onHighlightLegs(ev.segmentIndices!)}
              className="text-xs text-blue-400 hover:underline"
            >
              View on map
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function FailedRuleRow({
  ev,
  onHighlightLegs,
  scheduleComplete,
}: {
  ev: RuleEvaluation;
  onHighlightLegs?: (indices: number[]) => void;
  scheduleComplete?: boolean;
}) {
  const display = formatRuleEvaluation(ev);
  const selfDeclared = isSelfDeclared(ev);
  const badge = verificationBadge(ev, scheduleComplete);

  return (
    <li
      className={
        selfDeclared
          ? "border-b border-amber-900/30 py-3 last:border-0"
          : "border-b border-red-900/30 py-3 last:border-0"
      }
    >
      <div className="flex gap-2">
        <span
          className={`mt-0.5 shrink-0 ${selfDeclared ? "text-amber-400" : "text-red-400"}`}
          aria-hidden
        >
          {selfDeclared ? "!" : "✕"}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-medium leading-snug text-slate-200">{display.title}</p>
          {ev.message && ev.message !== display.title && (
            <p className="text-caption text-red-200/90">{ev.message}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {!selfDeclared && <Badge variant="danger">Failed</Badge>}
            {badge && (
              <Badge variant={badge.variant} title={badge.label}>
                {badge.label}
              </Badge>
            )}
            <Badge variant="ruleId">{display.ruleId}</Badge>
            {display.pdfRef && <span className="text-caption">{display.pdfRef}</span>}
          </div>
          {display.evidence && display.evidence.length > 0 && (
            <div className="rounded-md bg-red-950/30 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-300/80">
                Evidence
              </p>
              <ul className="mt-1 space-y-0.5 text-caption text-red-100/90">
                {display.evidence.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {ev.segmentIndices && ev.segmentIndices.length > 0 && onHighlightLegs && (
            <button
              type="button"
              onClick={() => onHighlightLegs(ev.segmentIndices!)}
              className="text-xs text-blue-400 hover:underline"
            >
              View on map
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function OriginReturnCard({ originReturn }: { originReturn: OriginReturnSummary }) {
  if (originReturn.mode === "closedLoop") {
    return (
      <Card className="border-green-900/40 bg-green-950/15" data-testid="origin-return-card">
        <p className="text-sm font-medium text-green-400">
          Returns to origin ({originReturn.originIata})
        </p>
        <p className="mt-1 text-caption">
          Closed loop — same departure and return airport (Rule 3015 §4(c)).
        </p>
      </Card>
    );
  }

  if (originReturn.mode === "openJaw") {
    return (
      <Card className="border-green-900/40 bg-green-950/15" data-testid="origin-return-card">
        <p className="text-sm font-medium text-green-400">
          Open jaw: {originReturn.originIata} → {originReturn.returnIata}
        </p>
        <p className="mt-1 text-caption">
          {originReturn.openJawLabel ?? "Permitted origin–destination surface exception"}
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-amber-900/40 bg-amber-950/15" data-testid="origin-return-card">
      <p className="text-sm font-medium text-amber-400">
        Return ({originReturn.returnIata}) not permitted with origin ({originReturn.originIata})
      </p>
      <p className="mt-1 text-caption">
        {originReturn.pendingHint ??
          "Choose a return airport in a permitted §4(c)(a)–(g) pair with your origin."}
      </p>
    </Card>
  );
}

export function ComplianceReport({
  ruleEvaluations,
  originReturn,
  valid = true,
  scheduleComplete = false,
  onHighlightLegs,
}: ComplianceReportProps) {
  const [search, setSearch] = useState("");
  const [showFullAudit, setShowFullAudit] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [showPassedWhenInvalid, setShowPassedWhenInvalid] = useState(false);

  const applicable = ruleEvaluations.filter(isDisplayable);
  const passedApplicable = applicable.filter((e) => e.passed);
  const failedApplicable = applicable.filter((e) => !e.passed && e.severity === "error");
  const warningApplicable = applicable.filter((e) => !e.passed && e.severity === "warning");
  const notApplicable = ruleEvaluations.filter(
    (e) => e.passed && e.applicability === "notApplicable",
  );
  const advisories = ruleEvaluations.filter(
    (e) => e.ruleKind === "advisory" && e.applicability === "active",
  );
  const totalEngineRules = ruleEvaluations.length;
  const routeValid = valid && failedApplicable.length === 0;

  const displayEvaluations = showFullAudit
    ? ruleEvaluations.filter((e) => e.passed && e.ruleKind !== "advisory")
    : passedApplicable;

  const grouped = useMemo(() => {
    const map = new Map<string, RuleEvaluation[]>();
    for (const ev of displayEvaluations) {
      const group = ev.displayGroup ?? ev.category ?? "other";
      const list = map.get(group) ?? [];
      list.push(ev);
      map.set(group, list);
    }
    return map;
  }, [displayEvaluations]);

  const filteredGrouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grouped;
    const next = new Map<string, RuleEvaluation[]>();
    for (const [group, rules] of grouped) {
      const filtered = rules.filter(
        (ev) =>
          ev.ruleId.toLowerCase().includes(q) ||
          ev.naturalLanguage.toLowerCase().includes(q) ||
          (ev.message?.toLowerCase().includes(q) ?? false),
      );
      if (filtered.length > 0) next.set(group, filtered);
    }
    return next;
  }, [grouped, search]);

  const filteredFailures = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return failedApplicable;
    return failedApplicable.filter(
      (ev) =>
        ev.ruleId.toLowerCase().includes(q) ||
        ev.naturalLanguage.toLowerCase().includes(q) ||
        (ev.message?.toLowerCase().includes(q) ?? false),
    );
  }, [failedApplicable, search]);

  const filteredWarnings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warningApplicable;
    return warningApplicable.filter(
      (ev) =>
        ev.ruleId.toLowerCase().includes(q) ||
        ev.naturalLanguage.toLowerCase().includes(q) ||
        (ev.message?.toLowerCase().includes(q) ?? false),
    );
  }, [warningApplicable, search]);

  const groups = GROUP_ORDER.filter((g) => filteredGrouped.has(g)).concat(
    [...filteredGrouped.keys()].filter((g) => !GROUP_ORDER.includes(g)),
  );

  function isGroupOpen(group: string): boolean {
    return expandAll || openGroups.has(group);
  }

  if (applicable.length === 0 && ruleEvaluations.length === 0) {
    return (
      <p className="text-body">
        No rule evaluations yet. Complete your route to see the compliance report.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {routeValid ? (
        <Card className="border-green-900/40 bg-green-950/20">
          <p className="text-sm font-semibold text-green-400">
            {passedApplicable.length} of {passedApplicable.length} applicable checks passed
            <span className="ml-2 font-normal text-surface-muted">
              ({totalEngineRules} total rules in engine)
            </span>
          </p>
          {!showFullAudit && notApplicable.length > 0 && (
            <p className="mt-1 text-caption">
              {notApplicable.length} rules not relevant to this route — expand below or show full
              audit.
            </p>
          )}
          {warningApplicable.length > 0 && (
            <p className="mt-1 text-caption text-amber-200/90">
              {warningApplicable.length} self-declared hint
              {warningApplicable.length === 1 ? "" : "s"} — confirm with flight times.
            </p>
          )}
        </Card>
      ) : (
        <Card className="border-red-900/50 bg-red-950/25">
          <p className="text-sm font-semibold text-red-400">
            {failedApplicable.length} applicable check{failedApplicable.length === 1 ? "" : "s"}{" "}
            failed
            {passedApplicable.length > 0 && (
              <span className="font-normal text-red-200/80">
                {" "}
                · {passedApplicable.length} still passing
              </span>
            )}
          </p>
          <p className="mt-1 text-caption">
            Extra ocean crossings, revisiting origin mid-trip, duplicate sectors, and intercontinental
            limits are evaluated here — not only origin/return.
          </p>
        </Card>
      )}

      {originReturn && <OriginReturnCard originReturn={originReturn} />}

      {advisories.length > 0 && (
        <Card className="border-surface-border bg-surface/40" padding="sm">
          <p className="text-xs font-medium text-surface-muted">Product checks (v0.2)</p>
          {advisories.map((ev) => (
            <p key={`${ev.ruleId}-${ev.message}`} className="mt-1 text-sm text-slate-300">
              {ev.naturalLanguage}
            </p>
          ))}
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search rules…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none ring-blue-500 focus:ring-2"
        />
        {routeValid && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setExpandAll((v) => !v);
                if (expandAll) setOpenGroups(new Set());
              }}
            >
              {expandAll ? "Collapse all" : "Expand all"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFullAudit((v) => !v)}
            >
              {showFullAudit ? "Applicable only" : "Show full audit trail"}
            </Button>
          </>
        )}
      </div>

      {filteredFailures.length > 0 && (
        <Card className="border-red-900/50 bg-red-950/20" padding="sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">
            Blocking failures
          </p>
          <ul>
            {filteredFailures.map((ev) => (
              <FailedRuleRow
                key={`${ev.ruleId}-${ev.message}`}
                ev={ev}
                onHighlightLegs={onHighlightLegs}
                scheduleComplete={scheduleComplete}
              />
            ))}
          </ul>
        </Card>
      )}

      {filteredWarnings.length > 0 && (
        <Card className="border-amber-900/50 bg-amber-950/20" padding="sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
            Self-declared hints
          </p>
          <ul>
            {filteredWarnings.map((ev) => (
              <FailedRuleRow
                key={`${ev.ruleId}-warn`}
                ev={ev}
                onHighlightLegs={onHighlightLegs}
                scheduleComplete={scheduleComplete}
              />
            ))}
          </ul>
        </Card>
      )}

      {passedApplicable.length > 0 && (
        <>
          {!routeValid && (
            <Accordion
              title={`Passed applicable checks (${passedApplicable.length})`}
              open={showPassedWhenInvalid}
              onOpenChange={setShowPassedWhenInvalid}
            >
              <div className="space-y-2">
                {groups.map((group) => {
                  const rules = filteredGrouped.get(group) ?? [];
                  return (
                    <div key={group}>
                      <p className="text-xs font-medium text-surface-muted">
                        {groupLabel(group)} ({rules.length})
                      </p>
                      <ul>
                        {rules.map((ev) => (
                          <PassedRuleRow
                            key={`${ev.ruleId}-${ev.message}`}
                            ev={ev}
                            onHighlightLegs={onHighlightLegs}
                            scheduleComplete={scheduleComplete}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          )}

          {routeValid && (
            <div className="space-y-2">
              {groups.map((group) => {
                const rules = filteredGrouped.get(group) ?? [];
                const open = isGroupOpen(group);
                return (
                  <Accordion
                    key={group}
                    open={open}
                    onOpenChange={(next) => {
                      if (expandAll) setExpandAll(false);
                      setOpenGroups((prev) => {
                        const updated = new Set(prev);
                        if (next) updated.add(group);
                        else updated.delete(group);
                        return updated;
                      });
                    }}
                    title={
                      <span>
                        {groupLabel(group)}{" "}
                        <span className="text-surface-muted">({rules.length} passed)</span>
                      </span>
                    }
                  >
                    <ul>
                      {rules.map((ev) => (
                        <PassedRuleRow
                          key={`${ev.ruleId}-${ev.message}`}
                          ev={ev}
                          onHighlightLegs={onHighlightLegs}
                          scheduleComplete={scheduleComplete}
                        />
                      ))}
                    </ul>
                  </Accordion>
                );
              })}
            </div>
          )}
        </>
      )}

      {routeValid && !showFullAudit && notApplicable.length > 0 && (
        <Accordion
          title={
            <span className="text-surface-muted">
              {notApplicable.length} rules not relevant to this route
            </span>
          }
        >
          <ul className="space-y-1 text-caption text-surface-muted">
            {notApplicable.map((ev) => (
              <li key={`${ev.ruleId}-${ev.message}`} className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="default"
                  title={notApplicableTooltip(ev.ruleId)}
                >
                  N/A
                </Badge>
                <span title={notApplicableTooltip(ev.ruleId)}>
                  {ev.ruleId} — {ev.naturalLanguage.slice(0, 80)}
                  {ev.naturalLanguage.length > 80 ? "…" : ""}
                </span>
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {routeValid && groups.length === 0 && search && (
        <p className="text-caption">No rules match &ldquo;{search}&rdquo;</p>
      )}
    </div>
  );
}
