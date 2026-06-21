import type { EvaluationContext } from "../../ontology/types.js";
import type { OpenJawType } from "../helpers/open-jaw.js";
import { detectOpenJawType } from "../helpers/open-jaw.js";
import { ruleError } from "./utils.js";

function openJawRule(
  ruleId: string,
  expected: OpenJawType,
  label: string,
) {
  return (ctx: EvaluationContext) => {
    const { itinerary } = ctx;
    const origin = itinerary.points[0]!;
    const termination = itinerary.points[itinerary.points.length - 1]!;
    if (origin.iata === termination.iata) return [];

    const jawType = detectOpenJawType(itinerary);
    if (jawType === expected) return [];

    return [];
  };
}

export const evaluateR3015_4c_open_jaw_a = openJawRule(
  "R3015-4c-open-jaw-a",
  "within-origin-country",
  "within country of origin",
);
export const evaluateR3015_4c_open_jaw_b = openJawRule(
  "R3015-4c-open-jaw-b",
  "within-middle-east",
  "within Middle East",
);
export const evaluateR3015_4c_open_jaw_c = openJawRule(
  "R3015-4c-open-jaw-c",
  "us-canada",
  "between US and Canada",
);
export const evaluateR3015_4c_open_jaw_d = openJawRule(
  "R3015-4c-open-jaw-d",
  "hkg-china",
  "between HKG and China",
);
export const evaluateR3015_4c_open_jaw_e = openJawRule(
  "R3015-4c-open-jaw-e",
  "my-sin",
  "between Malaysia and Singapore",
);
export const evaluateR3015_4c_open_jaw_f = openJawRule(
  "R3015-4c-open-jaw-f",
  "within-africa",
  "within Africa",
);
export const evaluateR3015_4c_open_jaw_g = openJawRule(
  "R3015-4c-open-jaw-g",
  "mv-lk-in",
  "between Maldives and Sri Lanka/India",
);
