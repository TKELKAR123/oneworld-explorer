import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForValidationOutcome,
  waitForVisualStable,
} from "../helpers/visual-stable";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("Visual — classic hero", () => {
  test("SC-001 valid route hero", async ({ page }) => {
    await loadClassicRoute(page);
    await disableAnimations(page);
    await waitForValidationOutcome(page);
    await expect(page.getByTestId("route-hero")).toHaveScreenshot("hero-classic-valid.png", {
      mask: visualMaskLocators(page),
    });
  });
});
