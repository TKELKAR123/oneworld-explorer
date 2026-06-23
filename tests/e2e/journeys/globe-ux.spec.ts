import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("@journey globe UX", () => {
  test("layer legend visible with explore anchor", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("globe-airport-search").fill("JFK");
    await page.getByTestId("globe-search-option-JFK").click();
    await expect(page.getByTestId("globe-layer-legend")).toContainText("Your route");
    await expect(page.getByTestId("globe-layer-legend")).toContainText("Possible hops");
  });

  test("classic route shows segment budget pills after load", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("segment-budget-europe-middle-east")).toBeVisible();
    await expect(page.getByTestId("segment-budget-asia")).toContainText("0/4");
  });
});
