import { expect, test } from "@playwright/test";
import {
  disableAnimations,
  visualMaskLocators,
  waitForVisualStable,
} from "../helpers/visual-stable";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("Visual — return guide OSL", () => {
  test("TOS chips visible with OSL origin", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await disableAnimations(page);
    await page.getByTestId("globe-airport-search").fill("Oslo");
    await page.getByTestId("globe-search-option-OSL").click();
    const returnPanel = page.getByTestId("return-options-panel");
    await expect(returnPanel).toBeVisible({ timeout: 15_000 });
    const open = await returnPanel.evaluate((el: HTMLDetailsElement) => el.open);
    if (!open) {
      await returnPanel.locator("summary").click();
    }
    await expect(page.getByTestId("return-guide-panel")).toBeVisible({ timeout: 15_000 });
    await waitForVisualStable(page);
    await expect(page.getByTestId("return-guide-panel")).toHaveScreenshot("return-guide-osl.png", {
      mask: visualMaskLocators(page),
    });
  });
});
