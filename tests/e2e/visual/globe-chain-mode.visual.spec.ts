import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForVisualStable,
} from "../helpers/visual-stable";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("Visual — globe chain mode", () => {
  test("OSL origin with chain mode enabled", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await disableAnimations(page);
    await page.getByTestId("globe-airport-search").fill("Oslo");
    await page.getByTestId("globe-search-option-OSL").click();
    await waitForVisualStable(page);
    await expect(page.getByTestId("globe-explorer")).toHaveScreenshot("globe-chain-mode.png", {
      mask: visualMaskLocators(page),
    });
  });
});
