import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — globe fullscreen", () => {
  test("expand opens overlay; close with Esc", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("globe-canvas")).toBeVisible();

    await page.getByTestId("globe-fullscreen-expand").click();
    await expect(page.getByTestId("globe-fullscreen-overlay")).toBeVisible();
    await expect(page.getByTestId("globe-canvas")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("globe-fullscreen-overlay")).not.toBeVisible();
  });
});
