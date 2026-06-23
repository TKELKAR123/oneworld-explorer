import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "./helpers/globe-metrics";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Return guide — OSL", () => {
  test("picking TOS with only OSL sets OSL + TOS return slot", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await pickAirportFromSearch(page, "Oslo", "OSL");
    const returnPanel = page.getByTestId("return-options-panel");
    await expect(returnPanel).toBeVisible({ timeout: 15_000 });
    const open = await returnPanel.evaluate((el: HTMLDetailsElement) => el.open);
    if (!open) {
      await returnPanel.locator("summary").click();
    }
    await expect(page.getByTestId("return-guide-panel")).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("return-guide-pick-TOS").click();

    await expect(page.getByTestId("route-chain")).toContainText("OSL-TOS");
    await expect(page.locator('input[value="OSL"]')).toBeVisible();
    await expect(page.locator('input[value="TOS"]')).toBeVisible();
  });
});
