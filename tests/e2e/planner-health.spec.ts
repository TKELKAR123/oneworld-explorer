import { expect, test } from "@playwright/test";
import { loadClassicRoute, openHealthDrawer, routeHero } from "./helpers/wait-for-validation";

test.describe("Route health panel", () => {
  test("checklist and issues panel render", async ({ page }) => {
    await loadClassicRoute(page);
    await openHealthDrawer(page);
    await expect(page.getByTestId("checklist-row-shape")).toBeVisible();
    await expect(page.getByTestId("issues-panel")).toBeVisible();
    await expect(routeHero(page)).toContainText(/Valid|Invalid/i);
  });

  test("premium economy shows surcharge copy", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("cabin-selector-premium-economy").click();
    await expect(routeHero(page)).toContainText(/surcharge/i, {
      timeout: 15_000,
    });
  });
});
