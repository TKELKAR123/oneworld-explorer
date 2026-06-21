import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Hub insert", () => {
  test("insert hub preserves destination stop", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await page.getByTestId("globe-airport-search").fill("Cebu");
    await page.getByTestId("globe-search-option-CEB").click();

    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    const stopInputs = page.locator('[data-testid="stop-row"] input');
    await stopInputs.last().fill("HND");
    await stopInputs.last().blur();

    await expect(page.locator('input[value="CEB"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[value="HND"]')).toBeVisible({ timeout: 5000 });

    const insertBtn = page.getByRole("button", { name: /Insert Hong Kong between CEB and HND/i });
    await expect(insertBtn).toBeVisible({ timeout: 20_000 });
    await insertBtn.click();

    await expect(page.locator('input[value="HKG"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[value="HND"]')).toBeVisible();
    await expect(page.getByTestId("hub-insert-message")).toContainText(/HND/i);
  });
});
