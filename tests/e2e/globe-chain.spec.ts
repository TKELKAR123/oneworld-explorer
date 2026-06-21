import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe chain mode", () => {
  test("adding destination from explore panel appends stop after origin", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByTestId("globe-chain-mode-add")).toHaveClass(/bg-emerald/);

    await page.getByTestId("globe-airport-search").fill("London");
    await page.getByTestId("globe-search-option-LHR").click();
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({
      timeout: 15_000,
    });

    const addDoh = page.getByTestId("explore-add-DOH");
    await expect(addDoh).toBeVisible({ timeout: 15_000 });
    await addDoh.click();
    await expect(page.getByTestId("route-chain")).toContainText("LHR-DOH", {
      timeout: 10_000,
    });
  });
});
