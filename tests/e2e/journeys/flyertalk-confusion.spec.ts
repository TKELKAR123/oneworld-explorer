import { expect, test } from "@playwright/test";
import {
  catalogScenarios,
  loadClassicRoute,
  loadScenarioByStops,
  openHealthDrawer,
  openTemplatesPanel,
  waitForAppReady,
  waitForValidation,
} from "../helpers/journeys";
import { routeHero, waitForOutcomeChip, recheckForValidRoute } from "../helpers/wait-for-validation";

const CONFUSION_IDS = [
  "SC-001",
  "SC-004",
  "SC-007",
  "SC-010",
  "SC-017",
  "SC-023",
  "SC-024",
  "SC-025",
];

test.describe("@journey flyertalk confusion", () => {
  for (const id of CONFUSION_IDS) {
    const scenario = catalogScenarios.find((s) => s.id === id);
    if (!scenario) continue;

    test(`${id} hero outcome matches catalog expectValid=${scenario.expectValid}`, async ({
      page,
    }) => {
      await loadScenarioByStops(page, scenario);
      if (scenario.expectValid) {
        await recheckForValidRoute(page);
      } else {
        await waitForOutcomeChip(page, /Invalid/i);
      }
    });
  }

  test("SC-023 implicit open jaw ORD never shows Invalid", async ({ page }) => {
    await loadClassicRoute(page);
    const lastInput = page.locator('[data-testid="stop-row"] input').last();
    await lastInput.fill("ORD");
    await lastInput.blur();
    await page.getByRole("button", { name: "Re-check" }).click();
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText(/Valid/i);
    await expect(routeHero(page)).not.toContainText(/^Invalid/i);
  });

  test("SC-001 invalid extension GIG shows Invalid not Draft", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    const lastInput = page.locator('[data-testid="stop-row"] input').last();
    await lastInput.fill("GIG");
    await lastInput.blur();
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText(/Invalid/i);
    await openHealthDrawer(page);
    await expect(page.getByTestId("issues-panel")).toContainText(/R3015-/i);
  });
});

test.describe("@journey templates", () => {
  test("SC-001 classic RTW — segment budgets include Asia/SWP 0/4", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await openTemplatesPanel(page);
    await page.getByTestId("route-starter-select").selectOption("SC-001");
    await waitForValidation(page);
    await page.getByRole("button", { name: "Re-check" }).click();
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText("Valid");
    await expect(page.getByTestId("segment-budget-asia")).toContainText("0/4");
    await expect(page.getByTestId("segment-budget-south-west-pacific")).toContainText("0/4");
  });
});
