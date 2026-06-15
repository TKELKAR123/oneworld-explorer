export type {
  Airport,
  Continent,
  Direction,
  EvaluationContext,
  ParsedItinerary,
  RouteAnalysis,
  RouteInput,
  RouteSegment,
  SubZone,
  TrafficZone,
  TravelClass,
  ValidateOptions,
  ValidationIssue,
  ValidationResult,
} from "./ontology/types.js";

export { parseRoute, normalizeSegments } from "./parse-route.js";
export { analyzeRoute } from "./analyze-route.js";
export { validateRoute, evaluate } from "./evaluate.js";
export { loadRuleRegistry, getV01Rules, getRuleById } from "./rules/registry.js";
export { EVALUATOR_MAP } from "./rules/evaluators/index.js";
export {
  resolveAirport,
  searchAirports,
  listAllAirports,
  getCountryMapping,
} from "./geography/resolve-airport.js";
export {
  RULES_VERSION,
  EXPLORER_RULES,
  FARE_BASIS,
  ELIGIBLE_CARRIERS,
} from "./rules/constants.js";
