import { expect, test } from "@playwright/test";
import {
  clickGlobeZoomIn,
  dragGlobe,
  pickAirportFromSearch,
  readZoomPercent,
  wheelOverGlobe,
} from "../helpers/globe-metrics";
import { waitForAppReady, waitForGlobeAtlas } from "../helpers/wait-for-validation";

test.describe("UX audit — globe reset view", () => {
  test("reset restores 100% zoom after drag and zoom in", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/");
    await waitForAppReady(page);
    await waitForGlobeAtlas(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-destinations-panel")).toContainText(
      /Next hops from LHR/i,
      { timeout: 15_000 },
    );

    await clickGlobeZoomIn(page, 2);
    await wheelOverGlobe(page, -500);
    await dragGlobe(page, 80, 40);
    await page.waitForTimeout(200);

    await expect.poll(() => readZoomPercent(page), { timeout: 15_000 }).toBeGreaterThan(100);

    await page.getByTestId("globe-reset-view").click();
    await expect.poll(() => readZoomPercent(page), { timeout: 15_000 }).toBe(100);
  });
});
