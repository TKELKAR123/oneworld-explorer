import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — globe map style", () => {
  test("map style dropdown switches modes", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");

    await expect(page.getByTestId("globe-map-style-toggle")).toBeVisible();

    await page.getByTestId("globe-map-style-toggle").click();
    await page.getByTestId("globe-map-style-tc-zones").click();
    await expect(page.getByTestId("globe-map-style-toggle")).toContainText(/TC zones/i);

    await page.getByTestId("globe-map-style-toggle").click();
    await page.getByTestId("globe-map-style-countries").click();
    await expect(page.getByTestId("globe-map-style-toggle")).toContainText(/Countries/i);

    await page.getByTestId("globe-map-style-toggle").click();
    await page.getByTestId("globe-map-style-minimal").click();
    await expect(page.getByTestId("globe-map-style-toggle")).toContainText(/Minimal/i);
  });
});
