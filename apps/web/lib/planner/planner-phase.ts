import type { ValidationResult } from "@oneworld-explorer/core";
import type { LegBookingDetails } from "../segment-booking";

export type PlannerPhase = "empty" | "building" | "auditing";

export function plannerPhase(
  stops: string[],
  legDetails: LegBookingDetails[],
  result: ValidationResult | null,
): PlannerPhase {
  if (stops.length === 0) return "empty";
  const hasPaste = legDetails.some(
    (d) => Boolean(d.marketingCarrier?.trim() || d.departureTime?.trim()),
  );
  const hasOutcome = stops.length >= 2 && Boolean(result?.outcome);
  if (hasPaste || hasOutcome) return "auditing";
  return "building";
}

export function plannerGridColumns(phase: PlannerPhase): {
  build: string;
  explore: string;
} {
  switch (phase) {
    case "empty":
      return { build: "minmax(280px, 32%)", explore: "minmax(0, 1fr)" };
    case "building":
      return { build: "minmax(300px, 40%)", explore: "minmax(0, 1fr)" };
    case "auditing":
      return { build: "minmax(320px, 52%)", explore: "minmax(0, 1fr)" };
  }
}

export function globeMinHeight(phase: PlannerPhase): number {
  return phase === "auditing" ? 400 : 520;
}

export function defaultMobileTab(phase: PlannerPhase): "plan" | "explore" | "checks" {
  return phase === "auditing" ? "plan" : "explore";
}
