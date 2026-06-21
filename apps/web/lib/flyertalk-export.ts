import type {
  RouteAnalysis,
  StopIntent,
  TravelClass,
  ValidationOutcome,
  ValidationResult,
} from "@oneworld-explorer/core";
import { continentLabel } from "./continent-labels";
import type { LegBookingDetails } from "./segment-booking";

export interface FlyerTalkExportInput {
  stops: string[];
  legDetails: LegBookingDetails[];
  stopIntents: StopIntent[];
  result: ValidationResult | null;
  travelClass: TravelClass;
}

function dashChain(stops: string[]): string {
  return stops.filter((s) => s.trim()).join("-");
}

function intentMark(intent: StopIntent, index: number, total: number): string {
  if (index === 0 || index === total - 1) return "";
  if (intent === "connection") return "(x)";
  return "";
}

function chainWithTransits(stops: string[], stopIntents: StopIntent[]): string {
  const filled = stops.map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (filled.length === 0) return "";
  return filled
    .map((s, i) => {
      const mark = intentMark(stopIntents[i] ?? "unknown", i, stops.length);
      return mark ? `${s}${mark}` : s;
    })
    .join("-");
}

function continentLedger(analysis: RouteAnalysis): string {
  return Object.entries(analysis.flightSegmentsByContinent)
    .filter(([, used]) => used > 0)
    .map(([c, used]) => {
      const limit =
        c === "north-america" ? 6 : 4;
      return `${continentLabel(c as never)} ${used}/${limit}`;
    })
    .join(" · ");
}

function oceanLines(analysis: RouteAnalysis): string {
  const parts: string[] = [];
  for (const seg of analysis.segments) {
    if (seg.crossesAtlantic) parts.push(`Atlantic ${seg.from.iata}→${seg.to.iata}`);
    if (seg.crossesPacific) parts.push(`Pacific ${seg.from.iata}→${seg.to.iata}`);
  }
  return parts.join(" · ");
}

function carrierLine(legDetails: LegBookingDetails[]): string {
  const carriers = legDetails
    .map((d) => d.marketingCarrier ?? d.operatingCarrier)
    .filter(Boolean);
  if (carriers.length === 0) return "Carriers: (paste from leg details)";
  return `Carriers: ${carriers.join(", ")}`;
}

export function buildFlyerTalkExport(input: FlyerTalkExportInput): string {
  const { stops, legDetails, stopIntents, result, travelClass } = input;
  const analysis = result?.analysis;
  const phase = result?.validationPhase ?? "building";
  const outcome = result?.outcome ?? null;

  const fare = analysis?.suggestedFareBasis ?? "fare TBD";
  const status =
    phase === "building"
      ? "building"
      : outcome === "valid"
        ? "valid (geometry)"
        : outcome === "validWithWarnings"
          ? "valid with warnings"
          : "invalid";

  const lines: string[] = [
    `${fare} · ${travelClass} · ${phase} · ${status} · ${analysis?.totalSegments ?? "?"} segments`,
    chainWithTransits(stops, stopIntents) || dashChain(stops),
  ];

  if (analysis) {
    const ledger = continentLedger(analysis);
    if (ledger) lines.push(ledger);
    const oceans = oceanLines(analysis);
    if (oceans) lines.push(oceans);
    if (analysis.originReturn.openJawLabel) {
      lines.push(`Return: ${analysis.originReturn.openJawLabel}`);
    }
  }

  lines.push(carrierLine(legDetails));
  return lines.join("\n");
}

export function buildRouteChainExport(stops: string[]): string {
  return dashChain(stops);
}
