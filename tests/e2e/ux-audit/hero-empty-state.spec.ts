import { expect, test } from "@playwright/test";
import { routeHero } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — empty hero", () => {
  test("empty load shows Start here, not Building", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(routeHero(page)).toContainText(/Start here/i);
    await expect(routeHero(page)).not.toContainText(/^Building/i);
    await expect(page.getByTestId("outcome-chip")).toBeVisible();
  });
});
