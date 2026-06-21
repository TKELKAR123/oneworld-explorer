export type {
  Airport,
  AttachedFlight,
  Continent,
  Direction,
  EvaluationContext,
  FareProduct,
  ItinerarySuggestion,
  LegScheduleState,
  LegScheduleStatus,
  OpenJawType,
  OriginReturnSummary,
  ParsedItinerary,
  RouteAnalysis,
  RouteInput,
  RouteSegment,
  RuleEvaluation,
  RuleEvaluationApplicability,
  RuleKind,
  ScheduleValidationSummary,
  StopListInput,
  StopIntent,
  SubZone,
  TrafficZone,
  TicketContext,
  TravelClass,
  ValidateOptions,
  ValidateRequestInput,
  ValidationIssue,
  ValidationMode,
  ValidationOutcome,
  ValidationPhase,
  ValidationResult,
} from "./ontology/types.js";

export {
  buildItineraryFromStops,
  stopsToLegs,
  validateSegmentContinuity,
  normalizeLegacySegments,
} from "./build-itinerary.js";
export { parseRoute, normalizeSegments } from "./parse-route.js";
export { analyzeRoute } from "./analyze-route.js";
export { previewAddStop } from "./preview-add-stop.js";
export type { AddStopImpact, ImpactTier, PreviewAddStopInput } from "./preview-add-stop.js";
export { validateRoute, validateRouteRequest, evaluate } from "./evaluate.js";
export { evaluateRulesWithTrace } from "./rules/evaluate-rules.js";
export { suggestFromSegments, suggestItineraryFixes } from "./surface-suggest.js";
export { loadRuleRegistry, getV01Rules, getRuleById } from "./rules/registry.js";
export { EVALUATOR_MAP } from "./rules/evaluators/index.js";
export {
  resolveAirport,
  searchAirports,
  listAllAirports,
  listAirportsInCountry,
  getCountryMapping,
  getCountryDisplayName,
} from "./geography/resolve-airport.js";
export { buildReturnGuide } from "./rules/helpers/return-guide.js";
export type { ReturnGuide, ReturnGuideOption } from "./rules/helpers/return-guide.js";
export {
  BUILDING_SUPPRESSED_CODES,
  inferValidationPhase,
  shouldSuppressInBuilding,
} from "./rules/applicability-phase.js";
export { buildGuidanceIssues } from "./rules/guidance-issues.js";
export type {
  MapStyleMode,
  CountryAtlasEntry,
  GeographyAtlas,
  GeoPolygon,
  GeoMultiPolygon,
} from "./ontology/geography-atlas.js";
export { GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST } from "./ontology/geography-atlas.js";
