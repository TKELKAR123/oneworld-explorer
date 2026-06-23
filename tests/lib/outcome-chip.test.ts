import { describe, expect, it } from "vitest";
import { outcomeChip } from "../../apps/web/lib/outcome-chip";
import type { ValidationResult } from "@oneworld-explorer/core";

function result(partial: Partial<ValidationResult>): ValidationResult {
  return {
    valid: false,
    outcome: "invalid",
    blockingIssueCount: 1,
    warningCount: 0,
    rulesVersion: "2026-02-27",
    issues: [{ code: "R3015-4c-origin", severity: "error", message: "bad open jaw" }],
    ruleEvaluations: [],
    validationPhase: "building",
    ...partial,
  } as ValidationResult;
}

describe("outcomeChip", () => {
  it("shows Invalid even in building phase", () => {
    const chip = outcomeChip(
      ["JFK", "LHR", "GIG"],
      result({ outcome: "invalid", validationPhase: "building" }),
      false,
    );
    expect(chip.label).toMatch(/Invalid/);
    expect(chip.variant).toBe("danger");
  });

  it("shows Needs return for openJawPending without blockers", () => {
    const chip = outcomeChip(
      ["JFK", "LHR", "DOH", "SIN"],
      result({
        valid: true,
        outcome: "valid",
        blockingIssueCount: 0,
        issues: [],
        validationPhase: "building",
        analysis: {
          originReturn: { mode: "openJawPending", originIata: "JFK", returnIata: "SIN" },
        } as ValidationResult["analysis"],
      }),
      false,
    );
    expect(chip.label).toBe("Needs return");
    expect(chip.variant).toBe("warning");
  });

  it("shows Valid only when ticketReady", () => {
    const chip = outcomeChip(
      ["JFK", "LHR", "DOH", "SIN", "SYD", "LAX", "JFK"],
      result({
        valid: true,
        outcome: "valid",
        blockingIssueCount: 0,
        issues: [],
        validationPhase: "ticketReady",
      }),
      false,
    );
    expect(chip.label).toBe("Valid");
    expect(chip.variant).toBe("success");
  });

  it("shows Draft for incomplete routes", () => {
    const chip = outcomeChip(["JFK", "LHR"], null, false);
    expect(chip.label).toBe("Draft");
  });
});
