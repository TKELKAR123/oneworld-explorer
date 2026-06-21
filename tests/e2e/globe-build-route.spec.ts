import { expect, test } from "@playwright/test";
import { loadClassicRoute, waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe build route", () => {
  test("segment ledger shows continent budgets after template load", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("segment-ledger")).toContainText(/NA|EU|AS|SP/i);
  });

  test("unified build mode shows explore destinations when origin set", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByTestId("globe-airport-search").fill("Oslo");
    await page.getByTestId("globe-search-option-OSL").click();
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({
      timeout: 15_000,
    });
  });
});
