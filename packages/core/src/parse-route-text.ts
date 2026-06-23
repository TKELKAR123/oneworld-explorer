import type { StopIntent, ValidationIssue } from "./ontology/types.js";

export interface ParsedRouteText {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  stopIntents: StopIntent[];
  parseIssues: ValidationIssue[];
}

const IATA_TOKEN = /^[A-Z]{3}$/i;
const SURFACE_MARKERS = new Set(["surface", "sfc", "ground"]);

function parseStopToken(raw: string): {
  iata: string;
  intent: StopIntent;
  surfaceAfter: boolean;
} | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const surfaceBracket = trimmed.match(/^([A-Za-z]{3})\s*-\s*\[surface\]$/i);
  if (surfaceBracket) {
    return { iata: surfaceBracket[1]!.toUpperCase(), intent: "unknown", surfaceAfter: true };
  }

  const withIntent = trimmed.match(/^([A-Za-z]{3})(\(x\))?$/i);
  if (withIntent) {
    return {
      iata: withIntent[1]!.toUpperCase(),
      intent: withIntent[2] ? "connection" : "unknown",
      surfaceAfter: false,
    };
  }

  if (IATA_TOKEN.test(trimmed)) {
    return { iata: trimmed.toUpperCase(), intent: "unknown", surfaceAfter: false };
  }

  return null;
}

/** Parse FlyerTalk-style route text into stops and leg types. */
export function parseRouteText(input: string): ParsedRouteText {
  const parseIssues: ValidationIssue[] = [];
  const stops: string[] = [];
  const legTypes: ("flight" | "surface")[] = [];
  const stopIntents: StopIntent[] = [];

  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const body = lines.join(" ");
  const chunks = body
    .split(/\s*\/\/\s*|\s*\/\s*|\s+-\s+|\s*-\s*|\s+/g)
    .map((c) => c.trim())
    .filter(Boolean);

  let nextLegSurface = false;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    if (SURFACE_MARKERS.has(chunk.toLowerCase()) || /^\[surface\]$/i.test(chunk)) {
      nextLegSurface = true;
      continue;
    }

    const parsed = parseStopToken(chunk);
    if (!parsed) {
      parseIssues.push({
        code: "PARSE_ROUTE_TEXT",
        severity: "error",
        message: `Unrecognized token: ${chunk.slice(0, 20)}`,
      });
      continue;
    }

    if (!IATA_TOKEN.test(parsed.iata)) {
      parseIssues.push({
        code: "PARSE_ROUTE_TEXT",
        severity: "error",
        message: `Invalid airport code: ${parsed.iata}`,
      });
      continue;
    }

    if (stops.length > 0) {
      legTypes.push(nextLegSurface ? "surface" : "flight");
      nextLegSurface = false;
    } else if (nextLegSurface) {
      parseIssues.push({
        code: "PARSE_ROUTE_TEXT",
        severity: "error",
        message: "Surface leg cannot start the route.",
      });
    }

    stops.push(parsed.iata);
    stopIntents.push(parsed.intent);
  }

  return { stops, legTypes, stopIntents, parseIssues };
}

export function formatRouteText(
  stops: string[],
  legTypes: ("flight" | "surface")[] = [],
  stopIntents: StopIntent[] = [],
): string {
  if (stops.length === 0) return "";

  const parts: string[] = [];
  for (let i = 0; i < stops.length; i++) {
    const code = stops[i]!.trim().toUpperCase();
    if (!IATA_TOKEN.test(code)) continue;

    let token = code;
    const intent = stopIntents[i];
    if (intent === "connection" && i > 0 && i < stops.length - 1) {
      token = `${code}(x)`;
    }

    parts.push(token);

    if (i < stops.length - 1) {
      const lt = legTypes[i] ?? "flight";
      if (lt === "surface") {
        parts.push("[surface]");
      }
    }
  }

  return parts.join("-");
}
