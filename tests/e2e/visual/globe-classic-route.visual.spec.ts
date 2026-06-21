import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForValidationOutcome,
} from "../helpers/visual-stable";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("Visual — globe classic route", () => {
  test("SC-001 route arcs on globe", async ({ page }) => {
    await loadClassicRoute(page);
    await disableAnimations(page);
    await waitForValidationOutcome(page);
    await expect(page.getByTestId("globe-canvas")).toHaveScreenshot("globe-classic-route.png", {
      mask: visualMaskLocators(page),
    });
  });
});
