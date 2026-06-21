import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForVisualStable,
} from "../helpers/visual-stable";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("Visual — building mode", () => {
  test("partial OSL-DOH route shows building badge", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await disableAnimations(page);
    await page.getByTestId("globe-airport-search").fill("Oslo");
    await page.getByTestId("globe-search-option-OSL").click();
    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    const stopInputs = page.locator('[data-testid="stop-row"] input');
    await stopInputs.last().fill("DOH");
    await stopInputs.last().blur();
    await waitForVisualStable(page);
    await expect(page.getByTestId("route-hero")).toHaveScreenshot("building-mode.png", {
      mask: visualMaskLocators(page),
    });
  });
});
