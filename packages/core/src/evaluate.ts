import { analyzeRoute } from "./analyze-route.js";
import {
  buildItineraryFromStops,
  normalizeLegacySegments,
} from "./build-itinerary.js";
import type {
  RouteInput,
  ValidationOutcome,
  ValidationResult,
  ValidateOptions,
  ValidateRequestInput,
} from "./ontology/types.js";
import { parseRoute } from "./parse-route.js";
import { evaluateRulesWithTrace } from "./rules/evaluate-rules.js";
import {
  inferValidationPhase,
  shouldSuppressInBuilding,
} from "./rules/applicability-phase.js";
import { buildGuidanceIssues } from "./rules/guidance-issues.js";
import { hasScheduleCompleteItinerary } from "./rules/helpers/gap-engine.js";
import { RULES_VERSION } from "./rules/constants.js";
import {
  buildScheduleSummary,
  segmentsFromLegScheduleStates,
} from "./schedule-summary.js";
import { suggestFromSegments } from "./surface-suggest.js";

function computeOutcome(issues: { severity: string }[]): {
  outcome: ValidationOutcome;
  valid: boolean;
  blockingIssueCount: number;
  warningCount: number;
} {
  const blockingIssueCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  if (blockingIssueCount > 0) {
    return {
      outcome: "invalid",
      valid: false,
      blockingIssueCount,
      warningCount,
    };
  }
  if (warningCount > 0) {
    return {
      outcome: "validWithWarnings",
      valid: true,
      blockingIssueCount: 0,
      warningCount,
    };
  }
  return {
    outcome: "valid",
    valid: true,
    blockingIssueCount: 0,
    warningCount: 0,
  };
}

function buildResult(
  parseIssues: ValidationResult["issues"],
  itinerary: ReturnType<typeof parseRoute>["itinerary"],
  options: ValidateOptions,
  suggestions?: ValidationResult["suggestions"],
  scheduleSummary?: ValidationResult["scheduleSummary"],
): ValidationResult {
  if (!itinerary) {
    const stats = computeOutcome(parseIssues);
    return {
      ...stats,
      rulesVersion: RULES_VERSION,
      issues: parseIssues,
      ruleEvaluations: [],
      suggestions,
      analysis: null,
    };
  }

  const analysis = analyzeRoute(itinerary, options);
  const { issues: ruleIssues, ruleEvaluations } = evaluateRulesWithTrace({
    itinerary,
    options,
    analysis,
    ticket: options.ticket,
  });
  let issues = [...parseIssues, ...ruleIssues];
  const validationPhase =
    options.validationPhase ?? options.clientPhase ?? inferValidationPhase(itinerary, analysis);
  const suppressedIssueCodes: string[] = [];
  let guidanceIssues = buildGuidanceIssues(itinerary, analysis);

  if (validationPhase === "building") {
    issues = issues.filter((issue) => {
      if (issue.severity === "error" && shouldSuppressInBuilding(issue.code)) {
        suppressedIssueCodes.push(issue.code);
        return false;
      }
      return true;
    });
  }

  const stats = computeOutcome(issues);

  return {
    ...stats,
    rulesVersion: RULES_VERSION,
    issues,
    ruleEvaluations,
    suggestions,
    analysis,
    scheduleSummary,
    validationPhase,
    guidanceIssues: validationPhase === "building" ? guidanceIssues : undefined,
    suppressedIssueCodes: suppressedIssueCodes.length ? suppressedIssueCodes : undefined,
  };
}

export function validateRoute(
  input: RouteInput,
  options: ValidateOptions = {},
): ValidationResult {
  const { itinerary, issues: parseIssues } = parseRoute(input);
  return buildResult(parseIssues, itinerary, options);
}

function mergeOptions(
  request: ValidateRequestInput,
  options: ValidateOptions,
): ValidateOptions {
  const travelClass = request.travelClass ?? options.travelClass ?? "economy";
  const ticket = request.ticket ?? options.ticket;
  const validationMode = request.validationMode ?? options.validationMode;
  const stopIntents = request.stopIntents ?? options.stopIntents;
  const validationPhase = request.validationPhase ?? request.clientPhase ?? options.validationPhase;
  const clientPhase = request.clientPhase ?? options.clientPhase;
  return {
    ...options,
    travelClass,
    ticket,
    validationMode,
    stopIntents,
    validationPhase,
    clientPhase,
  };
}

export function validateRouteRequest(
  request: ValidateRequestInput,
  options: ValidateOptions = {},
): ValidationResult {
  const opts = mergeOptions(request, options);

  if (request.stops?.length) {
    const { segments, issues: buildIssues } = buildItineraryFromStops({
      stops: request.stops,
      legTypes: request.legTypes,
    });
    if (buildIssues.length > 0) {
      const stats = computeOutcome(buildIssues);
      return {
        ...stats,
        rulesVersion: RULES_VERSION,
        issues: buildIssues,
        ruleEvaluations: [],
        analysis: null,
      };
    }
    return validateRoute(segments, opts);
  }

  if (request.segments?.length) {
    const mergedSegments = segmentsFromLegScheduleStates(
      request.segments,
      request.legScheduleStates,
    );
    const { segments, issues: continuityIssues } = normalizeLegacySegments(
      mergedSegments,
    );
    const suggestions = suggestFromSegments(segments);
    if (continuityIssues.length > 0) {
      const stats = computeOutcome(continuityIssues);
      return {
        ...stats,
        rulesVersion: RULES_VERSION,
        issues: continuityIssues,
        ruleEvaluations: [],
        suggestions,
        analysis: null,
      };
    }
    const { itinerary, issues: parseIssues } = parseRoute(segments);
    const scheduleSummary = itinerary
      ? buildScheduleSummary(itinerary, {
          validationMode: opts.validationMode,
          legScheduleStates: request.legScheduleStates,
          legTypes: request.legTypes,
        })
      : undefined;
    const enrichedOpts = {
      ...opts,
      scheduleComplete:
        scheduleSummary?.mode === "scheduleComplete" ||
        (itinerary ? hasScheduleCompleteItinerary(itinerary) : false),
    };
    return buildResult(parseIssues, itinerary, enrichedOpts, suggestions, scheduleSummary);
  }

  return {
    outcome: "invalid",
    valid: false,
    blockingIssueCount: 1,
    warningCount: 0,
    rulesVersion: RULES_VERSION,
    issues: [
      {
        code: "EMPTY_ROUTE",
        severity: "error",
        message: "Provide stops[] or segments[].",
      },
    ],
    ruleEvaluations: [],
    analysis: null,
  };
}

export { parseRoute } from "./parse-route.js";
export { analyzeRoute } from "./analyze-route.js";
export { validateRoute as evaluate };
