import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Planner pending overlay", () => {
  test("shows route-pending while validation is in flight", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await page.route("**/api/validate", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });

    await page.getByTestId("globe-airport-search").fill("Oslo");
    await page.getByTestId("globe-search-option-OSL").click();
    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    const stopInputs = page.locator('[data-testid="stop-row"] input');
    await stopInputs.last().fill("DOH");
    await stopInputs.last().blur();

    await expect(page.getByTestId("route-pending")).toBeVisible({ timeout: 5000 });
  });
});
