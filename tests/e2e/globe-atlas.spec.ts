import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "./helpers/globe-metrics";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe atlas", () => {
  test("globe canvas and network dots render in explore mode", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByTestId("globe-explorer")).toBeVisible();
    await expect(page.getByTestId("globe-canvas")).toBeVisible();
    await expect(page.getByTestId("explore-column").getByTestId("globe-airport-search")).toBeVisible();
  });

  test("globe search selects airport", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "Trom", "TOS");
    await expect(page.getByTestId("explore-destinations-panel")).toContainText(
      /Next hops from TOS/i,
      { timeout: 15_000 },
    );
  });
});
