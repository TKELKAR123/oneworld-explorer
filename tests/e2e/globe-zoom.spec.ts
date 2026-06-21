import { expect, test } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-validation";

test.describe("Globe zoom", () => {
  test("zoom controls change scale label", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);

    await expect(page.getByTestId("globe-zoom-controls")).toBeVisible();
    const before = await page.getByTestId("globe-zoom-controls").innerText();
    await page.getByTestId("globe-zoom-in").click();
    await page.getByTestId("globe-zoom-in").click();
    const after = await page.getByTestId("globe-zoom-controls").innerText();
    expect(after).not.toBe(before);
  });
});
