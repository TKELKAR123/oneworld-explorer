/**
 * Tier S — smoke-api: curated catalog scenarios via validate route handler.
 */
import { describe, expect, it } from "vitest";
import { POST } from "../../apps/web/app/api/validate/route.js";
import { scenariosByTag } from "../scenarios/run-scenario.js";

describe("catalog smoke-api (tier S)", () => {
  const smoke = scenariosByTag("smoke-api");

  it("has at least 25 smoke-api scenarios", () => {
    expect(smoke.length).toBeGreaterThanOrEqual(25);
  });

  for (const scenario of smoke) {
    it(`${scenario.id}: ${scenario.source}`, async () => {
      const res = await POST(
        new Request("http://test/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            travelClass: scenario.travelClass ?? "economy",
            segments: scenario.segments,
            ticket: scenario.ticket,
            validationPhase: scenario.validationPhase,
          }),
        }),
      );
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.valid).toBe(scenario.expectValid);
      if (scenario.expectRuleIds?.length) {
        for (const ruleId of scenario.expectRuleIds) {
          expect(body.issues.some((i: { code: string }) => i.code === ruleId)).toBe(true);
        }
      }
    });
  }
});
