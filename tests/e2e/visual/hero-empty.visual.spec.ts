import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForVisualStable,
} from "../helpers/visual-stable";

test.describe("Visual — empty hero", () => {
  test("default load with LHR-centered globe", async ({ page }) => {
    await page.goto("/");
    await disableAnimations(page);
    await waitForVisualStable(page);
    await expect(page.getByTestId("route-hero")).toBeVisible();
    await expect(page.getByTestId("route-hero")).toContainText(/Start here/i);

    await expect(page.getByTestId("route-hero")).toHaveScreenshot("hero-empty.png", {
      mask: visualMaskLocators(page),
    });
  });
});
