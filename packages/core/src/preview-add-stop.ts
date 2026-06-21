import type { Continent, RouteAnalysis, TravelClass } from "./ontology/types.js";
import { analyzeRoute } from "./analyze-route.js";
import { parseRoute } from "./parse-route.js";
import { EXPLORER_RULES } from "./rules/constants.js";

export type ImpactTier = "ok" | "info" | "warning" | "blocked";

export interface AddStopImpact {
  candidateIata: string;
  network: {
    tier: ImpactTier;
    feasibility: "direct" | "connect" | "none" | "unknown";
    carrierCount?: number;
    message: string;
  };
  routing: {
    tier: ImpactTier;
    continentCount?: number;
    continentDelta?: number;
    fareBasisHint?: string;
    segmentBudgetHints?: Array<{
      continent: Continent;
      used: number;
      limit: number;
      delta: number;
    }>;
    messages: string[];
  };
}

export interface PreviewAddStopInput {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  anchorIata: string;
  candidateIata: string;
  travelClass: TravelClass;
  currentAnalysis?: RouteAnalysis | null;
  networkDirect?: boolean;
  networkCarrierCount?: number;
}

function maxTier(a: ImpactTier, b: ImpactTier): ImpactTier {
  const order: ImpactTier[] = ["ok", "info", "warning", "blocked"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))]!;
}

function findLastAnchorIndex(stops: string[], anchorIata: string): number {
  let idx = -1;
  stops.forEach((s, i) => {
    if (s.trim().toUpperCase() === anchorIata.toUpperCase()) idx = i;
  });
  return idx >= 0 ? idx : Math.max(0, stops.length - 1);
}

function simulateAppend(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  candidateIata: string,
  anchorIata: string,
): { stops: string[]; legTypes: ("flight" | "surface")[]; alreadyOnRoute: boolean } {
  const code = candidateIata.trim().toUpperCase();
  if (stops.some((s) => s.trim().toUpperCase() === code)) {
    return { stops, legTypes, alreadyOnRoute: true };
  }
  const anchorIdx = findLastAnchorIndex(stops, anchorIata);
  const insertAt = anchorIdx + 1;
  const nextStops = [...stops];
  nextStops.splice(insertAt, 0, code);
  const nextLegs = [...legTypes];
  const legInsert = Math.max(0, insertAt - 1);
  nextLegs.splice(legInsert, 0, "flight");
  return { stops: nextStops, legTypes: nextLegs, alreadyOnRoute: false };
}

function assessNetwork(input: PreviewAddStopInput): AddStopImpact["network"] {
  const count = input.networkCarrierCount ?? 0;
  const direct = input.networkDirect ?? count > 0;
  if (direct && count > 0) {
    return {
      tier: "ok",
      feasibility: "direct",
      carrierCount: count,
      message: `Direct (${count} carrier${count === 1 ? "" : "s"})`,
    };
  }
  if (direct) {
    return { tier: "ok", feasibility: "direct", message: "Direct route published" };
  }
  if (input.networkDirect === false && count === 0) {
    return {
      tier: "warning",
      feasibility: "none",
      carrierCount: 0,
      message: "No published oneworld route",
    };
  }
  return { tier: "ok", feasibility: "unknown", message: "Network unknown" };
}

export function previewAddStop(input: PreviewAddStopInput): AddStopImpact {
  const candidate = input.candidateIata.trim().toUpperCase();
  const network = assessNetwork(input);

  const { stops: newStops, legTypes: newLegTypes, alreadyOnRoute } = simulateAppend(
    input.stops,
    input.legTypes,
    candidate,
    input.anchorIata,
  );

  if (alreadyOnRoute) {
    return {
      candidateIata: candidate,
      network,
      routing: {
        tier: "info",
        messages: ["Already on route"],
      },
    };
  }

  const filledStops = newStops.filter(Boolean);
  if (filledStops.length < 2) {
    return {
      candidateIata: candidate,
      network,
      routing: { tier: "ok", messages: [] },
    };
  }

  const segments = filledStops.slice(0, -1).map((from, i) => ({
    from: filledStops[i]!,
    to: filledStops[i + 1]!,
    surface: newLegTypes[i] === "surface",
  }));

  const parsed = parseRoute(segments);
  if (!parsed.itinerary) {
    return {
      candidateIata: candidate,
      network,
      routing: {
        tier: "blocked",
        messages: [parsed.issues[0]?.message ?? "Cannot parse route with this stop"],
      },
    };
  }

  const analysis = analyzeRoute(parsed.itinerary, { travelClass: input.travelClass });
  let tier: ImpactTier = "ok";
  const messages: string[] = [];
  const segmentBudgetHints: AddStopImpact["routing"]["segmentBudgetHints"] = [];

  const prevCount = input.currentAnalysis?.continentCount ?? 0;
  if (analysis.continentCount > prevCount && prevCount > 0) {
    tier = maxTier(tier, "info");
    messages.push(`Would visit ${analysis.continentCount} continents`);
  }

  const prevBasis = input.currentAnalysis?.suggestedFareBasis;
  const nextBasis = analysis.suggestedFareBasis;
  if (prevBasis && nextBasis && prevBasis !== nextBasis) {
    tier = maxTier(tier, "warning");
    messages.push(`May change fare basis toward ${nextBasis}`);
  } else if (!prevBasis && analysis.continentCount >= 3 && nextBasis) {
    tier = maxTier(tier, "info");
    messages.push(`Fare basis likely ${nextBasis}`);
  }

  for (const [continent, used] of Object.entries(analysis.flightSegmentsByContinent) as [
    Continent,
    number,
  ][]) {
    const limit = EXPLORER_RULES.flightSegmentLimits[continent];
    if (used >= limit - 1) {
      tier = maxTier(tier, "warning");
      segmentBudgetHints.push({ continent, used, limit, delta: 1 });
      messages.push(`Near ${continent.replace(/-/g, " ")} segment limit (${used}/${limit})`);
    }
  }

  return {
    candidateIata: candidate,
    network,
    routing: {
      tier,
      continentCount: analysis.continentCount,
      continentDelta:
        prevCount > 0 && analysis.continentCount > prevCount
          ? analysis.continentCount - prevCount
          : undefined,
      fareBasisHint:
        nextBasis && nextBasis !== prevBasis ? nextBasis : undefined,
      segmentBudgetHints,
      messages: messages.slice(0, 2),
    },
  };
}
