import { expect, test } from "@playwright/test";
import { clickGlobeZoomIn } from "./helpers/globe-metrics";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe zoom", () => {
  test("zoom controls change scale label", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    const controls = page.getByTestId("explore-column").getByTestId("globe-zoom-controls");
    await expect(controls).toBeVisible();
    const before = await controls.innerText();
    await clickGlobeZoomIn(page, 2);
    const after = await controls.innerText();
    expect(after).not.toBe(before);
  });
});
