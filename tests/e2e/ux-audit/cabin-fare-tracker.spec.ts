import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("UX audit — cabin fare tracker", () => {
  test("cabin switch shows booking class letter L / D / A", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("cabin-fare-tracker")).toBeVisible();
    await expect(page.getByTestId("cabin-fare-tracker")).toContainText(/Book in L class/i);

    await page.getByTestId("cabin-selector-business").click();
    await expect(page.getByTestId("cabin-fare-tracker")).toContainText(/Book in D class/i);

    await page.getByTestId("cabin-selector-first").click();
    await expect(page.getByTestId("cabin-fare-tracker")).toContainText(/Book in A class/i);
  });
});
