import { expect, test } from "@playwright/test";
import { waitForAppReady, waitForGlobeAtlas } from "../helpers/wait-for-validation";

test.describe("screens — building route", () => {
  test("globe canvas meets min height after anchor pick", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await waitForGlobeAtlas(page);

    await page.getByTestId("globe-airport-search").fill("LHR");
    await page.getByTestId("globe-search-option-LHR").click();
    await expect(page.getByTestId("globe-atlas-ready")).toBeVisible();

    const box = await page.getByTestId("globe-canvas").boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(400);
  });
});
