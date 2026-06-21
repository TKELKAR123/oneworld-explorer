import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe atlas", () => {
  test("globe canvas and network dots render in explore mode", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByTestId("globe-explorer")).toBeVisible();
    await expect(page.getByTestId("globe-canvas")).toBeVisible();
    await expect(page.getByTestId("globe-airport-search")).toBeVisible();
  });

  test("globe search selects airport", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByTestId("globe-airport-search").fill("Trom");
    await expect(page.getByTestId("globe-search-suggestions")).toBeVisible({ timeout: 8000 });
    await page.getByTestId("globe-search-option-TOS").click();
    await expect(page.getByText("Next hops from TOS")).toBeVisible({ timeout: 5000 });
  });
});
