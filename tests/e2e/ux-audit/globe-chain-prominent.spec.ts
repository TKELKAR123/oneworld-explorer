import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — prominent chain mode", () => {
  test("explore only shows banner; add to route appends stop", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");

    await page.getByTestId("globe-chain-mode-explore").click();
    await expect(page.getByTestId("globe-chain-mode-banner")).toBeVisible();

    await page.getByTestId("globe-chain-mode-add").click();
    await expect(page.getByTestId("globe-chain-mode-banner")).not.toBeVisible();

    await expect(page.getByTestId("explore-add-DOH")).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("explore-add-DOH").click();
    await expect(page.getByTestId("route-chain")).toContainText("DOH");
  });
});
