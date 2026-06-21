import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — chain mode", () => {
  test("chain off: airport click re-anchors without adding stop", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "Oslo", "OSL");
    await page.getByTestId("globe-chain-mode-explore").click();
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("route-chain")).not.toContainText("LHR");
    await expect(page.getByText(/Next hops from LHR/i)).toBeVisible({ timeout: 10_000 });
  });

  test("chain off: fan arc click does not append stop", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await page.getByTestId("globe-chain-mode-explore").click();
    await expect(page.getByTestId("explore-fan-arc-DOH")).toBeAttached({ timeout: 15_000 });
    await page.getByTestId("explore-fan-arc-DOH").click({ force: true });
    await expect(page.getByTestId("route-chain")).not.toContainText("DOH");
  });
});
