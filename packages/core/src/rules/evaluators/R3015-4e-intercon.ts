import type { Continent, EvaluationContext } from "../../ontology/types.js";
import { continentsCharged } from "../helpers/pricing.js";
import { countIntercontinentalEvents } from "../helpers/segments.js";
import { ruleError } from "./utils.js";

function interconLimits(continent: Continent, charged: Continent[]): { maxDep: number; maxArr: number } {
  let maxDep = 1;
  let maxArr = 1;
  if (continent === "north-america" || continent === "asia") {
    maxDep = 2;
    maxArr = 2;
  }
  if (continent === "europe-middle-east" && charged.includes("africa")) {
    maxDep = 2;
    maxArr = 2;
  }
  return { maxDep, maxArr };
}

export function evaluateR3015_4e_intercon(ctx: EvaluationContext) {
  const charged = continentsCharged(ctx.itinerary);
  const { departures, arrivals } = countIntercontinentalEvents(ctx.itinerary);
  const issues = [];

  for (const continent of charged) {
    const { maxDep, maxArr } = interconLimits(continent, charged);
    const dep = departures.get(continent) ?? 0;
    const arr = arrivals.get(continent) ?? 0;
    if (dep > maxDep) {
      issues.push(
        ruleError(
          "R3015-4e-intercon",
          `At most ${maxDep} intercontinental departure(s) allowed in ${continent}; found ${dep}.`,
        ),
      );
    }
    if (arr > maxArr) {
      issues.push(
        ruleError(
          "R3015-4e-intercon",
          `At most ${maxArr} intercontinental arrival(s) allowed in ${continent}; found ${arr}.`,
        ),
      );
    }
  }
  return issues;
}

function continentInterconRule(
  ruleId: string,
  continent: Continent,
  label: string,
) {
  return (ctx: EvaluationContext) => {
    const { departures, arrivals } = countIntercontinentalEvents(ctx.itinerary);
    const dep = departures.get(continent) ?? 0;
    const arr = arrivals.get(continent) ?? 0;
    const issues = [];
    if (dep > 2) {
      issues.push(
        ruleError(
          ruleId,
          `At most 2 intercontinental departures allowed in ${label}; found ${dep}.`,
        ),
      );
    }
    if (arr > 2) {
      issues.push(
        ruleError(
          ruleId,
          `At most 2 intercontinental arrivals allowed in ${label}; found ${arr}.`,
        ),
      );
    }
    return issues;
  };
}

export const evaluateR3015_4e_1_na = continentInterconRule(
  "R3015-4e-1-na",
  "north-america",
  "North America",
);
export const evaluateR3015_4e_2_asia = continentInterconRule(
  "R3015-4e-2-asia",
  "asia",
  "Asia",
);

export function evaluateR3015_4e_3_africa_eu(ctx: EvaluationContext) {
  const charged = continentsCharged(ctx.itinerary);
  if (!charged.includes("africa")) return [];

  const { departures, arrivals } = countIntercontinentalEvents(ctx.itinerary);
  const hasEuDep = [...departures.entries()].some(
    ([c, n]) => c === "europe-middle-east" && n > 0,
  );
  const hasEuArr = [...arrivals.entries()].some(
    ([c, n]) => c === "europe-middle-east" && n > 0,
  );
  if (!hasEuDep || !hasEuArr) return [];

  const issues = [];
  for (const p of ctx.itinerary.points) {
    if (p.country === "MU" || p.country === "ZA") {
      issues.push(
        ruleError(
          "R3015-4e-3-africa-eu",
          `Mauritius and South Africa may not be included when Europe is touched in both directions with Africa (${p.iata}).`,
        ),
      );
    }
  }
  return issues;
}
