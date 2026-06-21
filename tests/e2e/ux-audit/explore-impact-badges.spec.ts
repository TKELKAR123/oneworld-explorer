import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — explore impact badges", () => {
  test("next hop row shows network impact text", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-destinations-panel")).toBeVisible({ timeout: 10_000 });

    const impact = page.getByTestId("explore-impact-DOH");
    await expect.poll(async () => (await impact.textContent())?.trim() ?? "", {
      timeout: 15_000,
    }).not.toBe("");
  });
});
