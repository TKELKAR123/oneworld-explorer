import { expect, test } from "@playwright/test";
import catalogData from "../scenarios/catalog.json";
import { loadClassicRoute, openHealthDrawer, routeHero, waitForValidation } from "./helpers/wait-for-validation";

interface CatalogScenario {
  id: string;
  source: string;
  tags?: string[];
  travelClass?: string;
  segments: Array<Record<string, unknown>>;
  ticket?: Record<string, unknown>;
  expectValid: boolean;
}

const catalogScenarios = (
  Array.isArray(catalogData) ? catalogData : (catalogData as { scenarios: CatalogScenario[] }).scenarios
) as CatalogScenario[];

const smokeUi = catalogScenarios.filter((s) => s.tags?.includes("smoke-ui"));

test.describe("catalog smoke-ui (tier E)", () => {
  test("catalog defines smoke-ui scenarios", () => {
    expect(smokeUi.length).toBeGreaterThanOrEqual(10);
  });

  for (const scenario of smokeUi) {
    test(`${scenario.id}: API ${scenario.source}`, async ({ request }) => {
      const res = await request.post("/api/validate", {
        data: {
          travelClass: scenario.travelClass ?? "economy",
          segments: scenario.segments,
          ticket: scenario.ticket,
        },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.valid).toBe(scenario.expectValid);
    });
  }
});

test.describe("catalog UI flows", () => {
  test("SC-001 classic RTW loads valid", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(routeHero(page)).toContainText("Valid");
  });

  test("SC-023 implicit open jaw via last stop ORD", async ({ page }) => {
    await loadClassicRoute(page);
    const rows = page.locator('[data-testid="stop-row"]');
    const lastInput = rows.last().locator("input");
    await lastInput.fill("ORD");
    await lastInput.blur();
    await waitForValidation(page);
    await expect(page.getByTestId("stop-card-6")).toContainText(/Within country of origin/i, {
      timeout: 15_000,
    });
    await expect(routeHero(page)).toContainText("Valid");
  });

  test("SC-026 booking panel: UA carrier fails validation", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("leg-details-toggle-0").click();
    const carrierInput = page.getByTestId("leg-marketing-carrier-0");
    await carrierInput.fill("UA");
    await carrierInput.blur();
    await page.getByRole("button", { name: "Re-check" }).click();
    await expect(routeHero(page)).toContainText(/Invalid/i, {
      timeout: 15_000,
    });
  });

  test("autocomplete selects TOS for Troms", async ({ page }) => {
    await loadClassicRoute(page);
    const firstInput = page.locator('[data-testid="stop-row"] input').first();
    await firstInput.fill("Trom");
    await expect(page.getByTestId("airport-suggestions")).toBeVisible({ timeout: 8000 });
    await page.getByTestId("airport-option-TOS").click();
    await expect(firstInput).toHaveValue("TOS");
  });

  test("invalid route shows issues panel", async ({ page }) => {
    await loadClassicRoute(page);
    const lastInput = page.locator('[data-testid="stop-row"] input').last();
    await lastInput.fill("LHR");
    await lastInput.blur();
    await waitForValidation(page);
    await openHealthDrawer(page);
    await expect(page.getByTestId("issues-panel")).toContainText(/R3015-/i, {
      timeout: 15_000,
    });
  });
});
