import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "./helpers/wait-for-validation";

test.describe("Planner leg cards", () => {
  test("feasibility visible on first leg without scrolling", async ({ page }) => {
    await loadClassicRoute(page);
    const feasibility = page.getByTestId("leg-feasibility-0");
    await expect(feasibility).toBeVisible();
    await expect(feasibility).toContainText(
      /Route index|Observed alliance|Published alliance route/i,
    );
  });

  test("Google Flights link on leg card", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("leg-search-flights-0")).toBeVisible();
  });

  test("flight details collapse expands", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("leg-details-toggle-0").click();
    await expect(page.getByTestId("leg-marketing-carrier-0")).toBeVisible();
  });
});
