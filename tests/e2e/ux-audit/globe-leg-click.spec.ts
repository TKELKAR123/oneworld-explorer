import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — leg click fills destination", () => {
  test("clicking itinerary leg with empty next stop fills destination IATA", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "Oslo", "OSL");
    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    await expect(page.locator('[data-testid="stop-row"]')).toHaveCount(2, { timeout: 5000 });
    await page.getByTestId("globe-chain-mode-explore").click();
    await pickAirportFromSearch(page, "Doha", "DOH");
    await expect(page.getByText(/Next hops from DOH/i)).toBeVisible({ timeout: 10_000 });

    await expect(page.getByTestId("globe-leg-arc-0")).toBeAttached({ timeout: 10_000 });
    await page.getByTestId("globe-leg-arc-0").evaluate((el) => {
      (el as HTMLButtonElement).click();
    });
    await expect(page.getByTestId("route-chain")).toContainText("OSL-DOH", { timeout: 10_000 });
  });
});
