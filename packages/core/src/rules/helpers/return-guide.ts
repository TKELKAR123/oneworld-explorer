import type { Airport, OpenJawType } from "../../ontology/types.js";
import { OPEN_JAW_LABELS } from "../rule-metadata.js";
import {
  getCountryDisplayName,
  listAirportsInCountry,
  resolveAirport,
} from "../../geography/resolve-airport.js";

export interface ReturnGuideOption {
  type: OpenJawType | "closedLoop";
  label: string;
  description: string;
  exampleIatas: string[];
  /** ISO country code for filtering search, when applicable */
  countryIso?: string;
}

export interface ReturnGuide {
  originIata: string;
  originCountry: string;
  originCountryName: string;
  options: ReturnGuideOption[];
  /** Short hint for the return stop while building */
  summaryHint: string;
}

const EXAMPLE_HUBS: Record<string, string[]> = {
  NO: ["OSL", "TOS", "BGO", "TRD"],
  US: ["JFK", "LAX", "ORD", "MIA"],
  GB: ["LHR", "LGW", "MAN"],
  AU: ["SYD", "MEL", "BNE"],
  JP: ["HND", "NRT"],
  SG: ["SIN"],
  MY: ["KUL"],
};

function exampleIatasForCountry(iso: string, originIata: string): string[] {
  const hubs = EXAMPLE_HUBS[iso] ?? [];
  const fromData = listAirportsInCountry(iso)
    .slice(0, 8)
    .map((a) => a.iata);
  const merged = [...new Set([...hubs, ...fromData])].filter((i) => i !== originIata);
  return merged.slice(0, 6);
}

function closedLoopOption(origin: Airport): ReturnGuideOption {
  return {
    type: "closedLoop",
    label: `Return to ${origin.iata}`,
    description: "Closed loop — same origin and return airport.",
    exampleIatas: [origin.iata],
  };
}

function withinCountryOption(origin: Airport): ReturnGuideOption {
  const countryName = getCountryDisplayName(origin.country);
  return {
    type: "within-origin-country",
    label: `Any airport in ${countryName}`,
    description: OPEN_JAW_LABELS["within-origin-country"],
    exampleIatas: exampleIatasForCountry(origin.country, origin.iata),
    countryIso: origin.country,
  };
}

export function buildReturnGuide(originIata: string): ReturnGuide | null {
  const origin = resolveAirport(originIata);
  if (!origin) return null;

  const options: ReturnGuideOption[] = [closedLoopOption(origin), withinCountryOption(origin)];
  const countryName = getCountryDisplayName(origin.country);

  if (origin.country === "US" || origin.country === "CA") {
    options.push({
      type: "us-canada",
      label: "US / Canada open jaw",
      description: OPEN_JAW_LABELS["us-canada"],
      exampleIatas: origin.country === "US" ? ["YYZ", "YVR", "YUL"] : ["JFK", "LAX", "ORD"],
    });
  }

  if (origin.subZone === "middle-east") {
    options.push({
      type: "within-middle-east",
      label: "Middle East open jaw",
      description: OPEN_JAW_LABELS["within-middle-east"],
      exampleIatas: ["DXB", "DOH", "AUH", "AMM"],
    });
  }

  if (origin.country === "CN" || origin.country === "HK") {
    options.push({
      type: "hkg-china",
      label: "Hong Kong / China",
      description: OPEN_JAW_LABELS["hkg-china"],
      exampleIatas: ["HKG", "PVG", "PEK"],
    });
  }

  if (origin.country === "MY" || origin.country === "SG") {
    options.push({
      type: "my-sin",
      label: "Malaysia / Singapore",
      description: OPEN_JAW_LABELS["my-sin"],
      exampleIatas: origin.country === "MY" ? ["SIN"] : ["KUL"],
    });
  }

  if (origin.continent === "africa") {
    options.push({
      type: "within-africa",
      label: "Africa open jaw",
      description: OPEN_JAW_LABELS["within-africa"],
      exampleIatas: ["JNB", "CPT", "NBO", "CAI"],
    });
  }

  if (["MV", "LK", "IN"].includes(origin.country)) {
    options.push({
      type: "mv-lk-in",
      label: "Maldives / Sri Lanka / India",
      description: OPEN_JAW_LABELS["mv-lk-in"],
      exampleIatas: ["MLE", "CMB", "DEL", "BOM"],
    });
  }

  const summaryHint = `Finish in ${countryName} (e.g. ${exampleIatasForCountry(origin.country, origin.iata).slice(0, 3).join(", ")}) or return to ${origin.iata}`;

  return {
    originIata: origin.iata,
    originCountry: origin.country,
    originCountryName: countryName,
    options,
    summaryHint,
  };
}
