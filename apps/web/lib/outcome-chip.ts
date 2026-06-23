import type { ValidationResult } from "@oneworld-explorer/core";

export type OutcomeChipVariant = "metric" | "success" | "warning" | "danger";

export interface OutcomeChip {
  label: string;
  variant: OutcomeChipVariant;
}

export function outcomeChip(
  stops: string[],
  result: ValidationResult | null,
  loading: boolean,
): OutcomeChip {
  if (stops.length === 0) return { label: "Start here", variant: "metric" };
  if (loading && !result) return { label: "Checking…", variant: "metric" };

  if (result?.outcome === "invalid") {
    const n = result.blockingIssueCount ?? result.issues.filter((i) => i.severity === "error").length;
    return { label: n > 0 ? `Invalid (${n})` : "Invalid", variant: "danger" };
  }

  if (result?.outcome === "validWithWarnings") {
    return { label: "Valid · warnings", variant: "warning" };
  }

  if (result?.outcome === "valid" && result.validationPhase === "ticketReady") {
    return { label: "Valid", variant: "success" };
  }

  if (result?.analysis?.originReturn.mode === "openJawPending") {
    return { label: "Needs return", variant: "warning" };
  }

  const filled = stops.filter((s) => /^[A-Z]{3}$/i.test(s.trim())).length;
  if (filled < 4 || (result?.analysis?.continentCount ?? 0) < 3) {
    return { label: "Draft", variant: "metric" };
  }

  if (result?.validationPhase === "building") {
    return { label: "Draft", variant: "metric" };
  }

  return { label: "Checking…", variant: "metric" };
}
