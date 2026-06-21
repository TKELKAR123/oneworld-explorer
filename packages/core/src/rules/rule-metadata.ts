import type { RuleKind, RuleApplicabilityMode } from "../ontology/types.js";
import { getRuleById } from "./registry.js";

export interface RuleDisplayMeta {
  ruleKind: RuleKind;
  displayGroup: string;
  applicability: RuleApplicabilityMode;
}

const DEFAULT: RuleDisplayMeta = {
  ruleKind: "tariff",
  displayGroup: "structural",
  applicability: "always",
};

const META: Record<string, Partial<RuleDisplayMeta>> = {
  "R3015-0-fare-class": { displayGroup: "pricing" },
  "R3015-0-continent-count": { displayGroup: "pricing" },
  "R3015-0-three-continent-origin": { displayGroup: "pricing" },
  "R3015-0-fare-basis": { displayGroup: "pricing" },
  "R3015-0-swp-eu-via-asia": { displayGroup: "pricing" },
  "R3015-itinerary-continuity": { displayGroup: "routing" },
  "R3015-4a": { displayGroup: "ocean-crossing" },
  "R3015-4b-direction": { displayGroup: "routing" },
  "R3015-4b-hawaii": {
    ruleKind: "exception",
    displayGroup: "regional",
    applicability: "whenTriggered",
  },
  "R3015-4c-origin": { displayGroup: "origin-return" },
  "R3015-4c-open-jaw-a": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-b": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-c": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-d": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-e": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-f": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4c-open-jaw-g": {
    ruleKind: "exception",
    displayGroup: "open-jaw",
    applicability: "whenTriggered",
  },
  "R3015-4d-no-via-origin": { displayGroup: "origin-return" },
  "R3015-4e-intercon": { displayGroup: "routing" },
  "R3015-4e-1-na": { displayGroup: "routing" },
  "R3015-4e-2-asia": { displayGroup: "routing" },
  "R3015-4e-3-africa-eu": { displayGroup: "routing" },
  "R3015-4f-origin-intl": { displayGroup: "origin-return" },
  "R3015-4f-usa-exception": { displayGroup: "origin-return" },
  "R3015-4f-us-ca-domestic": { displayGroup: "origin-return" },
  "R3015-4g-surface": { displayGroup: "routing" },
  "R3015-4g-swp-transoceanic": {
    ruleKind: "exception",
    displayGroup: "regional",
    applicability: "whenTriggered",
  },
  "R3015-4h-segment-count": { displayGroup: "segment-budget" },
  "R3015-4h-continent-limits": { displayGroup: "segment-budget" },
  "R3015-4i-duplicate-sector": { displayGroup: "routing" },
  "R3015-4k-us-transcon": {
    ruleKind: "exception",
    displayGroup: "regional",
    applicability: "whenTriggered",
  },
  "R3015-4k-alaska": {
    ruleKind: "exception",
    displayGroup: "regional",
    applicability: "whenTriggered",
  },
  "R3015-4l-australia": {
    ruleKind: "exception",
    displayGroup: "regional",
    applicability: "whenTriggered",
  },
  "R3015-4-carriers": {
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
  "R3015-4j-codeshare": {
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
  "R3015-4j-jq-qq": {
    ruleKind: "exception",
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
  "R3015-4-affiliates": {
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
  "R3015-4-no-ground-transport": {
    displayGroup: "routing",
    applicability: "whenTriggered",
  },
  "R3015-0-purchase": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-0-IONE3-markets": {
    displayGroup: "pricing",
    applicability: "whenTriggered",
  },
  "R3015-0-tc-def": { displayGroup: "geography" },
  "R3015-0-continent-def": { displayGroup: "geography" },
  "R3015-0-eu-me-zones": { displayGroup: "geography" },
  "R3015-0-asia-countries": { displayGroup: "geography" },
  "R3015-0-na-includes": { displayGroup: "geography" },
  "R3015-5-reservations": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-5b-booking": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-6-min-stay": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-7-max-stay": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-8-stopovers": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-9-transfers": {
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
  "R3015-15-stock": {
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-15-stock-jq": {
    ruleKind: "exception",
    displayGroup: "ticketing",
    applicability: "whenTriggered",
  },
  "R3015-15-cuba": {
    displayGroup: "sales",
    applicability: "whenTriggered",
  },
  "R3015-4-carriers-warn": {
    ruleKind: "advisory",
    displayGroup: "carrier",
    applicability: "whenTriggered",
  },
};

export function getRuleDisplayMeta(ruleId: string): RuleDisplayMeta {
  const rule = getRuleById(ruleId);
  const fromYaml: Partial<RuleDisplayMeta> = {};
  if (rule?.ruleKind) fromYaml.ruleKind = rule.ruleKind;
  if (rule?.displayGroup) fromYaml.displayGroup = rule.displayGroup;
  if (rule?.applicability) fromYaml.applicability = rule.applicability;

  const partial = META[ruleId];
  return { ...DEFAULT, ...partial, ...fromYaml };
}

export const OPEN_JAW_LABELS: Record<string, string> = {
  "within-origin-country": "Within country of origin (§4c-a)",
  "within-middle-east": "Within Middle East (§4c-b)",
  "us-canada": "Between US and Canada (§4c-c)",
  "hkg-china": "Between HKG and China (§4c-d)",
  "my-sin": "Between Malaysia and Singapore (§4c-e)",
  "within-africa": "Within Africa (§4c-f)",
  "mv-lk-in": "Between Maldives and Sri Lanka/India (§4c-g)",
};
