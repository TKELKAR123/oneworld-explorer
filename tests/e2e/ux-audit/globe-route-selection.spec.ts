import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — globe route selection", () => {
  test("LHR next hops panel lists destinations and add works", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("explore-add-DOH")).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("explore-add-DOH").click();
    await expect(page.getByTestId("route-chain")).toContainText("LHR-DOH");
  });

  test("hover next hop highlights list row", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-dest-DOH")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("explore-dest-DOH").hover();
    await expect(page.getByTestId("explore-dest-DOH")).toHaveClass(/bg-blue-950/);
  });
});
