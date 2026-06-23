import { expect, type Page } from "@playwright/test";
import catalogData from "../../scenarios/catalog.json";
import {
  loadClassicRoute,
  openHealthDrawer,
  openTemplatesPanel,
  routeHero,
  waitForAppReady,
  waitForValidation,
} from "../helpers/wait-for-validation";

interface CatalogScenario {
  id: string;
  source: string;
  tags?: string[];
  segments: Array<{ from: string; to: string; surface?: boolean }>;
  expectValid: boolean;
}

export const catalogScenarios = (
  Array.isArray(catalogData) ? catalogData : (catalogData as { scenarios: CatalogScenario[] }).scenarios
) as CatalogScenario[];

export async function loadScenarioByStops(page: Page, scenario: CatalogScenario) {
  const stops: string[] = [];
  for (const seg of scenario.segments) {
    if (stops.length === 0) stops.push(seg.from);
    stops.push(seg.to);
  }
  await page.goto("/");
  await waitForAppReady(page);
  await page.getByTestId("route-text-panel").locator("summary").click();
  const textarea = page.getByTestId("route-text-input");
  await textarea.fill(stops.join("-"));
  await page.getByTestId("route-text-apply").click();
  await waitForValidation(page);
}

export async function expectOutcomeMatchesValid(page: Page, expectValid: boolean) {
  const hero = routeHero(page);
  if (expectValid) {
    await expect(hero).toContainText(/Valid/i);
    await expect(hero).not.toContainText(/^Invalid/i);
  } else {
    await expect(hero).toContainText(/Invalid/i);
  }
}

export { loadClassicRoute, openHealthDrawer, openTemplatesPanel, waitForAppReady, waitForValidation };
