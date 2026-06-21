import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — explore data honesty", () => {
  test("NRT anchor does not show inactive JFK as direct add", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "Tokyo", "NRT");
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("explore-add-JFK")).not.toBeVisible();
    await expect(page.getByTestId("explore-fan-arc-JFK")).toHaveCount(0);
  });
});
