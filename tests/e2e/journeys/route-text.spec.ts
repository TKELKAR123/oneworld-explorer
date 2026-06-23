import { expect, test } from "@playwright/test";
import { loadClassicRoute, routeHero, waitForAppReady, waitForValidation } from "../helpers/wait-for-validation";

test.describe("@journey route text", () => {
  test("paste SC-001 dash chain populates stops and validates", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.getByTestId("route-text-panel").locator("summary").click();
    await page.getByTestId("route-text-input").fill("JFK-LHR-DOH-SIN-SYD-LAX-JFK");
    await page.getByTestId("route-text-apply").click();
    await expect(page.getByTestId("route-chain")).toContainText("JFK");
    await waitForValidation(page);
    await page.getByRole("button", { name: "Re-check" }).click();
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText("Valid");
  });

  test("broken continuity shows Invalid", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("route-text-panel").locator("summary").click();
    await page.getByTestId("route-text-input").fill("JFK-LHR-DOH-SIN");
    await page.getByTestId("route-text-apply").click();
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText(/Invalid|Draft/i);
  });

  test("text bar syncs when template loaded", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("route-text-panel").locator("summary").click();
    await expect(page.getByTestId("route-text-input")).toHaveValue(/JFK-LHR-DOH-SIN-SYD-LAX-JFK/);
  });
});
