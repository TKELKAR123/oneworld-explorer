import { expect, test } from "@playwright/test";
import { openTemplatesPanel, waitForAppReady, waitForValidation } from "./helpers/wait-for-validation";

test.describe("Planner discovery", () => {
  test("loads blank then classic eastbound starter", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByTestId("itinerary-empty-state")).toBeVisible();
    await openTemplatesPanel(page);
    await page.getByTestId("route-starter-select").selectOption("SC-001");
    await waitForValidation(page);
    await expect(page.getByTestId("stop-card-0").locator("input")).toHaveValue("JFK");
    await expect(page.getByTestId("leg-feasibility-0")).toContainText(
      /Route index|Observed alliance|Published alliance route/i,
      {
      timeout: 10_000,
    });
  });
});
