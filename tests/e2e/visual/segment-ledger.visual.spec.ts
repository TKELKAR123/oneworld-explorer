import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForValidationOutcome,
} from "../helpers/visual-stable";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("Visual — segment ledger", () => {
  test("classic route shows segment ledger", async ({ page }) => {
    await loadClassicRoute(page);
    await disableAnimations(page);
    await waitForValidationOutcome(page);
    await expect(page.getByTestId("segment-ledger")).toBeVisible();
    await expect(page.getByTestId("route-hero")).toHaveScreenshot("segment-ledger-classic.png", {
      mask: visualMaskLocators(page),
    });
  });
});
