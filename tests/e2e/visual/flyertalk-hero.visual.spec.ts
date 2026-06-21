import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForValidationOutcome,
} from "../helpers/visual-stable";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("Visual — FlyerTalk hero", () => {
  test("copy buttons on valid classic route", async ({ page }) => {
    await loadClassicRoute(page);
    await disableAnimations(page);
    await waitForValidationOutcome(page);
    await expect(page.getByTestId("copy-flyertalk")).toBeVisible();
    await expect(page.getByTestId("route-hero")).toHaveScreenshot("flyertalk-hero.png", {
      mask: visualMaskLocators(page),
    });
  });
});
