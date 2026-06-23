import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("UX audit — globe tooltips", () => {
  test("globe layer legend documents arc types", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("globe-airport-search").fill("JFK");
    await page.getByTestId("globe-search-option-JFK").click();
    await expect(page.getByTestId("globe-layer-legend")).toContainText("Your route");
    await expect(page.getByTestId("globe-layer-legend")).toContainText("Possible hops");
  });

  test("classic route renders leg arc hooks with labels via sr-only hooks", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("globe-leg-arc-0")).toBeAttached({ timeout: 15_000 });
    await expect(page.getByTestId("globe-leg-arc-2")).toBeAttached();
  });
});
