import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe explore fan", () => {
  test("add destination from explore panel", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByTestId("globe-airport-search").fill("Los Angeles");
    await page.getByTestId("globe-search-option-LAX").click();
    await expect(page.getByText("Next hops from LAX")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({ timeout: 15_000 });
    const addOrd = page.getByTestId("explore-add-ORD");
    await expect(addOrd).toBeVisible({ timeout: 10_000 });
    await addOrd.click();
    await expect(page.locator('input[value="ORD"]')).toBeVisible({ timeout: 15_000 });
  });
});
