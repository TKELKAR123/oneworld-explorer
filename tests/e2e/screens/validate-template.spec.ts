import { expect, test } from "@playwright/test";
import { loadClassicRoute, routeHero, waitForAppReady } from "../helpers/wait-for-validation";

test.describe("screens — validate template", () => {
  test("SC-001 loads outcome within hero", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(routeHero(page)).toContainText(/Valid|Invalid|Building/i);
  });

  test("leg paste input still available", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("leg-details-toggle-0").click();
    await expect(page.getByTestId("leg-paste-input").first()).toBeVisible();
  });
});

test.describe("screens — empty", () => {
  test("shows Start here without health drawer", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(routeHero(page)).toContainText(/Start here/i);
    await expect(page.getByTestId("health-drawer-strip")).toHaveCount(0);
  });
});
