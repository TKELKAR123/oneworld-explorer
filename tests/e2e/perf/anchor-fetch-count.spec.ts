import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("perf — anchor fetch count", () => {
  test("selecting LHR triggers single destinations and preview-add requests", async ({ page }) => {
    const destinations: string[] = [];
    const previewAdd: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/routes/destinations?")) destinations.push(url);
      if (url.includes("/api/itinerary/preview-add")) previewAdd.push(url);
    });

    await page.goto("/");
    await waitForAppReady(page);

    await pickAirportFromSearch(page, "LHR", "LHR");

    await expect(page.getByTestId("explore-destinations-panel")).toContainText(
      /Next hops from LHR/i,
      { timeout: 15_000 },
    );

    await page.waitForTimeout(800);

    expect(destinations.length).toBeLessThanOrEqual(2);
    expect(previewAdd.length).toBeLessThanOrEqual(2);
    expect(destinations.length).toBeGreaterThanOrEqual(1);
  });
});
