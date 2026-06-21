import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForVisualStable,
} from "../helpers/visual-stable";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("Visual — globe empty LHR", () => {
  test("default globe centered on London", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await disableAnimations(page);
    await waitForVisualStable(page);
    await expect(page.getByTestId("globe-canvas")).toHaveScreenshot("globe-empty-lhr.png", {
      mask: visualMaskLocators(page),
    });
  });
});
