import type { ValidationOutcome } from "@oneworld-explorer/core";

export function outcomeLabel(
  outcome: ValidationOutcome | null | "building",
  blockingCount = 0,
  loading = false,
): string {
  if (loading) return "Checking route…";
  if (outcome === "building") return "Still building route";
  if (!outcome) return "Still building route";
  if (outcome === "valid") return "Ready to quote";
  if (outcome === "validWithWarnings") return "Ready with caveats";
  return `Needs fixes (${blockingCount || 1})`;
}
