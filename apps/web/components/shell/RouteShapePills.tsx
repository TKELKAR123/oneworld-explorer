"use client";

import type { OriginReturnSummary, RouteAnalysis } from "@oneworld-explorer/core";
import { continentLabel } from "../../lib/continent-labels";
import { MetricDivider, MetricPill } from "../ui";

export interface RouteShapePillsProps {
  analysis: RouteAnalysis | null;
  originReturn?: OriginReturnSummary | null;
}

export function RouteShapePills({ analysis, originReturn }: RouteShapePillsProps) {
  if (!analysis) return null;

  const continentNames = analysis.continentsVisited.map((c) => continentLabel(c)).join(", ");

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-testid="route-shape-pills"
    >
      <MetricPill
        value={`${analysis.continentCount} continents`}
        title={continentNames || undefined}
      />
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
    </div>
  );
}
