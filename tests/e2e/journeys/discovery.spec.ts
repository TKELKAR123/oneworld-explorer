import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "../helpers/globe-metrics";
import {
  waitForAppReady,
  waitForOutcomeChip,
  waitForValidation,
} from "../helpers/wait-for-validation";

test.describe("@journey discovery", () => {
  test("cold start explorer — search LHR, see destinations", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByTestId("itinerary-empty-state")).toBeVisible();
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-destinations-panel")).toContainText(
      /Next hops from LHR/i,
      { timeout: 15_000 },
    );
    await expect(page.getByTestId("globe-layer-legend")).toBeVisible();
  });

  test("planner origin first — JFK via globe shows draft state", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "JFK", "JFK");
    await waitForValidation(page);
    await waitForOutcomeChip(page, /Draft|Needs return/i);
  });
});
