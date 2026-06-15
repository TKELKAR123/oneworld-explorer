import { validateRoute } from "@oneworld-explorer/core";
import type { RouteSegment, ValidateOptions } from "@oneworld-explorer/core";

export const CLASSIC_RTW: RouteSegment[] = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

export function validate(
  segments: RouteSegment[],
  options: ValidateOptions = { travelClass: "economy" },
) {
  return validateRoute(segments, options);
}

export function hasRule(result: ReturnType<typeof validate>, ruleId: string) {
  return result.issues.some((i) => i.code === ruleId);
}

export function ruleErrors(result: ReturnType<typeof validate>, ruleId: string) {
  return result.issues.filter((i) => i.code === ruleId && i.severity === "error");
}
