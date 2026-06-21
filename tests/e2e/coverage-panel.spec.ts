import { expect, test } from "@playwright/test";
import { loadClassicRoute, openHealthDrawer } from "./helpers/wait-for-validation";

test.describe("Route health checklist", () => {
  test("shows validation checklist", async ({ page }) => {
    await loadClassicRoute(page);
    await openHealthDrawer(page);
    await expect(page.getByTestId("checklist-row-shape")).toBeVisible();
    await expect(page.getByText("What's checked")).toBeVisible();
  });
});
