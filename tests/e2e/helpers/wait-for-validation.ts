import { expect, type Page } from "@playwright/test";

/** App shell loaded (blank itinerary is OK). */
export async function waitForAppReady(page: Page) {
  await expect(page.getByRole("heading", { name: "oneworld Explorer" })).toBeVisible();
  await expect(page.getByTestId("explore-column")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("route-hero")).toContainText(/Start here|Pick origin/i);
}

/** Globe geography atlas fetched and WebGL shell ready. */
export async function waitForGlobeAtlas(page: Page) {
  await expect(page.getByTestId("globe-atlas-ready")).toBeVisible({ timeout: 90_000 });
}

/** Wait until auto-validation finishes and route hero shows an outcome. */
export async function waitForValidation(page: Page) {
  await expect(page.getByTestId("route-hero")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("route-hero")).toContainText(
    /Valid|Invalid|Building|Ready to quote|Needs fixes|Ready with caveats/i,
    { timeout: 30_000 },
  );
}

/** Hero strip (outcome, fare basis, segment ledger). */
export function routeHero(page: Page) {
  return page.getByTestId("route-hero");
}

/** Expand health drawer to access checklist and issues. */
export async function openHealthDrawer(page: Page) {
  await expect(page.getByTestId("health-drawer-strip")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByTestId("health-drawer-open").click();
  await expect(page.getByTestId("validation-checklist")).toBeVisible({
    timeout: 10_000,
  });
}

/** Open collapsed Templates panel in the build column. */
export async function openTemplatesPanel(page: Page) {
  const panel = page.getByTestId("templates-panel");
  await expect(panel).toBeVisible();
  const open = await panel.evaluate((el: HTMLDetailsElement) => el.open);
  if (!open) {
    await panel.locator("summary").click();
  }
  await expect(page.getByTestId("route-starter-select")).toBeVisible();
}

/** Load the classic eastbound RTW template (SC-001) for tests that need a full route. */
export async function loadClassicRoute(page: Page) {
  await page.goto("/");
  await waitForAppReady(page);
  await openTemplatesPanel(page);
  await page.getByTestId("route-starter-select").selectOption("SC-001");
  await expect(page.getByTestId("route-chain")).toContainText(/JFK/i, {
    timeout: 15_000,
  });
  await waitForValidation(page);
}
